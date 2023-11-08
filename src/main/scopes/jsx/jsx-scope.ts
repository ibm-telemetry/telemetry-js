/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type ts from 'typescript'

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { getPackageData } from '../npm/get-package-data.js'
import { findDeepestContainingDirectory } from './find-deepest-containing-directory.js'
import { getPackageJsonTree } from './get-package-json-tree.js'
import { getTrackedSourceFiles } from './get-tracked-source-files.js'
import { AllImportMatcher } from './import-matchers/all-import-matcher.js'
import { DefaultImportMatcher } from './import-matchers/default-import-matcher.js'
import { NamedImportMatcher } from './import-matchers/named-import-matcher.js'
import { RenamedImportMatcher } from './import-matchers/renamed-import-matcher.js'
import { type FileTree, type JsxElementImportMatcher } from './interfaces.js'
import { JsxElementAccumulator } from './jsx-element-accumulator.js'
import { jsxNodeHandlerMap } from './jsx-node-handler-map.js'
import { ElementMetric } from './metrics/element-metric.js'
import { NodeParser } from './node-parser.js'

/**
 * Scope class dedicated to data collection from a jsx environment.
 */
export class JsxScope extends Scope {
  public override name = 'jsx' as const

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
      new DefaultImportMatcher(),
      new NamedImportMatcher(),
      new RenamedImportMatcher()
    ]
    const packageJsonTree = await getPackageJsonTree(this.root, this.cwd, this.logger)
    const instrumentedPackage = await getPackageData(this.cwd, this.logger)
    const sourceFiles = await getTrackedSourceFiles(this.cwd, this.logger)

    const promises = sourceFiles.map(async (sourceFile) => {
      const accumulator = new JsxElementAccumulator()

      this.parseFile(accumulator, sourceFile)
      this.removeIrrelevantImports(accumulator, instrumentedPackage.name)
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
    })

    await Promise.allSettled(promises)
  }

  /**
   * Given a source file node, finds all JSX elements/imports and stores them in an accumulator.
   *
   * @param accumulator - The accumulator in which to store elements/imports.
   * @param sourceFile - Root AST node to start Jsx explorations from.
   */
  parseFile(accumulator: JsxElementAccumulator, sourceFile: ts.SourceFile) {
    const parser = new NodeParser(accumulator, jsxNodeHandlerMap, this.logger)

    parser.visit(sourceFile, sourceFile)
  }

  removeIrrelevantImports(accumulator: JsxElementAccumulator, instrumentedPackageName: string) {
    const imports = accumulator.imports.filter((jsxImport) =>
      jsxImport.path.startsWith(instrumentedPackageName)
    )

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

  async resolveInvokers(
    accumulator: JsxElementAccumulator,
    fileName: string,
    packageJsonTree: FileTree[]
  ) {
    const promises = accumulator.elements.map(async (jsxElement) => {
      const containingDir = findDeepestContainingDirectory(fileName, packageJsonTree)

      if (containingDir === undefined) {
        return undefined
      }

      const containingPackageData = await getPackageData(containingDir, this.logger)

      accumulator.elementInvokers.set(jsxElement, containingPackageData.name)
    })

    await Promise.allSettled(promises)
  }
}
