/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import type * as ts from 'typescript'

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { findRelevantSourceFiles } from '../js/find-relevant-source-files.js'
import { JsImportMatcher } from '../js/interfaces.js'
import { processFile } from '../js/process-file.js'
import { removeIrrelevantImports } from '../js/remove-irrelevant-imports.js'
import { getDirectoryPrefix } from '../npm/get-directory-prefix.js'
import { getPackageData } from '../npm/get-package-data.js'
import { PackageData } from '../npm/interfaces.js'
import { JsxElementAllImportMatcher } from './import-matchers/jsx-element-all-import-matcher.js'
import { JsxElementNamedImportMatcher } from './import-matchers/jsx-element-named-import-matcher.js'
import { JsxElementRenamedImportMatcher } from './import-matchers/jsx-element-renamed-import-matcher.js'
import { JsxElement } from './interfaces.js'
import { JsxElementAccumulator } from './jsx-element-accumulator.js'
import { jsxNodeHandlerMap } from './jsx-node-handler-map.js'
import { ElementMetric } from './metrics/element-metric.js'

/**
 * Scope class dedicated to data collection from a jsx environment.
 */
export class JsxScope extends Scope {
  public override name = 'jsx' as const
  private runSync = false
  public static readonly fileExtensions = ['.js', '.mjs', '.cjs', '.jsx', '.tsx']

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
          promises.push(this.captureAllMetrics())
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
  async captureAllMetrics(): Promise<void> {
    const importMatchers = [
      new JsxElementAllImportMatcher(),
      new JsxElementNamedImportMatcher(),
      new JsxElementRenamedImportMatcher()
    ]
    const instrumentedPackage = await getPackageData(this.cwd, this.cwd, this.logger)
    const sourceFiles = await findRelevantSourceFiles(
      instrumentedPackage,
      this.cwd,
      this.root,
      JsxScope.fileExtensions,
      this.logger
    )

    this.logger.debug('Filtered source files: ' + sourceFiles.map((f) => f.fileName))

    const promises: Promise<void>[] = []

    for (const sourceFile of sourceFiles) {
      const resultPromise = this.captureFileMetrics(sourceFile, instrumentedPackage, importMatchers)

      if (this.runSync) {
        await resultPromise
      } else {
        promises.push(resultPromise)
      }
    }

    await Promise.allSettled(promises)
  }

  /**
   * Generates metrics for all discovered instrumented jsx elements found
   * in the supplied SourceFile node.
   *
   * @param sourceFile - The sourcefile node to generate metrics for.
   * @param instrumentedPackage - Name and version of the instrumented package
   * to capture metrics for.
   * @param importMatchers - Matchers instances to use for import-element matching.
   */
  async captureFileMetrics(
    sourceFile: ts.SourceFile,
    instrumentedPackage: PackageData,
    importMatchers: JsImportMatcher<JsxElement>[]
  ) {
    const accumulator = new JsxElementAccumulator()

    processFile(accumulator, sourceFile, jsxNodeHandlerMap, this.logger)
    removeIrrelevantImports(accumulator, instrumentedPackage.name)
    this.resolveElementImports(accumulator, importMatchers)
    await this.resolveInvokers(accumulator, sourceFile.fileName)

    accumulator.elements.forEach((jsxElement) => {
      const jsxImport = accumulator.elementImports.get(jsxElement)
      const invoker = accumulator.elementInvokers.get(jsxElement)

      if (jsxImport === undefined) {
        return
      }

      this.capture(
        new ElementMetric(
          jsxElement,
          jsxImport,
          invoker,
          instrumentedPackage,
          this.config,
          this.logger
        )
      )
    })
  }

  resolveElementImports(
    accumulator: JsxElementAccumulator,
    elementMatchers: JsImportMatcher<JsxElement>[]
  ) {
    accumulator.elements.forEach((jsxElement) => {
      const jsxImport = elementMatchers
        .map((elementMatcher) => elementMatcher.findMatch(jsxElement, accumulator.imports))
        .find((jsxImport) => jsxImport !== undefined)

      if (jsxImport === undefined) {
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
   */
  async resolveInvokers(accumulator: JsxElementAccumulator, sourceFilePath: string) {
    const containingDir = await getDirectoryPrefix(path.dirname(sourceFilePath), this.logger)

    if (containingDir === undefined) {
      return
    }

    const containingPackageData = await getPackageData(containingDir, this.root, this.logger)

    accumulator.elements.forEach((jsxElement) => {
      accumulator.elementInvokers.set(jsxElement, containingPackageData.name)
    })
  }

  /**
   * **For testing purposes only.**
   * Makes the JsxScope collection run "synchronously" (one source file at a time). Defaults to
   * `false`.
   *
   * @param runSync - Boolean of whether or not to run synchronously.
   */
  setRunSync(runSync: boolean) {
    this.runSync = runSync
  }
}
