/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { getPackageData } from '../npm/get-package-data.js'
import { AllImportMatcher } from './import-matchers/all-import-matcher.js'
import { NamedImportMatcher } from './import-matchers/named-import-matcher.js'
import { RenamedImportMatcher } from './import-matchers/renamed-import-matcher.js'
import { type FileTree, type JsxElementImportMatcher } from './interfaces.js'
import { JsxElementAccumulator } from './jsx-element-accumulator.js'
import { jsxNodeHandlerMap } from './maps/jsx-node-handler-map.js'
import { ElementMetric } from './metrics/element-metric.js'
import { SourceFileHandler } from './node-handlers/source-file-handler.js'
import { findDeepestContainingDirectory } from './utils/find-deepest-containing-directory.js'
import { getPackageJsonTree } from './utils/get-package-json-tree.js'
import { getTrackedSourceFiles } from './utils/get-tracked-source-files.js'

/**
 * Scope class dedicated to data collection from a jsx environment.
 */
export class JsxScope extends Scope {
  public override name = 'jsx' as const
  private RUN_SYNC = false

  /**
   * Entry point for the scope. All scopes run asynchronously.
   */
  @Trace()
  public override async run(): Promise<void> {
    const collectorKeys = this.config.collect[this.name]
    if (collectorKeys === undefined || Object.keys(collectorKeys).length === 0) {
      throw new EmptyScopeError(this.name)
    }

    const promises: Array<Promise<void>> = []

    Object.keys(collectorKeys).forEach((key) => {
      switch (key) {
        case 'elements':
          promises.push(this.captureElementMetrics())
          break
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Generates metrics for all discovered instrumented jsx elements found in the current working
   * directory's project.
   */
  @Trace()
  async captureElementMetrics(): Promise<void> {
    const importMatchers = [
      new AllImportMatcher(),
      new NamedImportMatcher(),
      new RenamedImportMatcher()
    ]
    const packageJsonTree = await getPackageJsonTree(this.root, this.logger)
    const instrumentedPackage = await getPackageData(this.cwd, this.logger)
    const sourceFiles = await getTrackedSourceFiles(this.root, this.logger)

    const promises: Promise<void>[] = []

    for (const sourceFile of sourceFiles) {
      if (this.RUN_SYNC) {
        await this.captureFileMetrics(
          sourceFile,
          instrumentedPackage.name,
          importMatchers,
          packageJsonTree
        )
      } else {
        promises.push(
          this.captureFileMetrics(
            sourceFile,
            instrumentedPackage.name,
            importMatchers,
            packageJsonTree
          )
        )
      }
    }

    await Promise.allSettled(promises)
  }

  /**
   * Generates metrics for all discovered instrumented jsx elements found
   * in the supplied SourceFile node.
   *
   * @param sourceFile - The sourcefile node to generate metrics for.
   * @param instrumentedPackageName - Name of the instrumented package to capture metrics for.
   * @param importMatchers - Matchers instances to use for import-element matching.
   * @param packageJsonTree - Pre-computed FileTree of Directory's Package.json.
   */
  @Trace()
  async captureFileMetrics(
    sourceFile: ts.SourceFile,
    instrumentedPackageName: string,
    importMatchers: JsxElementImportMatcher[],
    packageJsonTree: FileTree[]
  ) {
    const accumulator = new JsxElementAccumulator()

    this.processFile(accumulator, sourceFile)
    this.removeIrrelevantImports(accumulator, instrumentedPackageName)
    this.resolveElementImports(accumulator, importMatchers)
    await this.resolveInvokers(accumulator, sourceFile.fileName, packageJsonTree)

    accumulator.elements.forEach((jsxElement) => {
      const jsxImport = accumulator.elementImports.get(jsxElement)
      const invoker = accumulator.elementInvokers.get(jsxElement)

      if (jsxImport === undefined) {
        return
      }

      this.capture(new ElementMetric(jsxElement, jsxImport, invoker, this.config, this.logger))
    })
  }

  /**
   * Given a source file node, finds all JSX elements/imports and stores them in an accumulator.
   *
   * @param accumulator - The accumulator in which to store elements/imports.
   * @param sourceFile - Root AST node to start Jsx explorations from.
   */
  @Trace({
    argFormatter: (arg) =>
      arg instanceof JsxElementAccumulator ? '[JsxElementAccumulator]' : arg?.fileName
  })
  processFile(accumulator: JsxElementAccumulator, sourceFile: ts.SourceFile) {
    const handler = new SourceFileHandler(accumulator, jsxNodeHandlerMap, this.logger)

    handler.handle(sourceFile, sourceFile)
  }

  removeIrrelevantImports(accumulator: JsxElementAccumulator, instrumentedPackageName: string) {
    const imports = accumulator.imports.filter((jsxImport) => {
      return jsxImport.path.startsWith(instrumentedPackageName)
    })

    accumulator.imports.splice(0, accumulator.imports.length, ...imports)
  }

  resolveElementImports(
    accumulator: JsxElementAccumulator,
    elementMatchers: JsxElementImportMatcher[]
  ) {
    accumulator.elements.forEach((jsxElement) => {
      const jsxImport = elementMatchers
        .map((elementMatcher) => elementMatcher.findMatch(jsxElement, accumulator.imports))
        .find((jsxImport) => jsxImport !== undefined)

      if (!jsxImport) {
        return
      }

      accumulator.elementImports.set(jsxElement, jsxImport)
    })
  }

  /**
   * Adds data to the accumulator for each package that invokes the jsx elements in the accumulator.
   *
   * @param accumulator - Accumulator to store results in.
   * @param sourceFilePath - Absolute path to a sourceFile.
   * @param packageJsonTree - Directory tree of package.json files.
   */
  async resolveInvokers(
    accumulator: JsxElementAccumulator,
    sourceFilePath: string,
    packageJsonTree: FileTree[]
  ) {
    const containingDir = findDeepestContainingDirectory(
      sourceFilePath,
      packageJsonTree,
      this.logger
    )

    if (containingDir === undefined) {
      return
    }

    const containingPackageData = await getPackageData(containingDir, this.logger)

    accumulator.elements.forEach((jsxElement) => {
      accumulator.elementInvokers.set(jsxElement, containingPackageData.name)
    })
  }
  /**
   * For testing purposes only. Makes the JsxScope collection run "synchronously"
   * (one source file at a time).
   *
   */
  SetRunSync() {
    this.RUN_SYNC = true
  }
}
