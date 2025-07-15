/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { findRelevantSourceFiles } from '../js/find-relevant-source-files.js'
import type { JsImportMatcher } from '../js/interfaces.js'
import { processFile } from '../js/process-file.js'
import { removeIrrelevantImports } from '../js/remove-irrelevant-imports.js'
import { JsxElementAllImportMatcher } from '../jsx/import-matchers/jsx-element-all-import-matcher.js'
import { JsxElementNamedImportMatcher } from '../jsx/import-matchers/jsx-element-named-import-matcher.js'
import { JsxElementRenamedImportMatcher } from '../jsx/import-matchers/jsx-element-renamed-import-matcher.js'
// import { type WcElement } from './interfaces.js'
import { type JsxElement } from '../jsx/interfaces.js'
import { ElementMetric } from '../jsx/metrics/element-metric.js'
import { getPackageData } from '../npm/get-package-data.js'
import type { PackageData } from '../npm/interfaces.js'
import { WcElementAccumulator } from './wc-element-accumulator.js'
import { jsxNodeHandlerMap } from './wc-node-handler-map.js'

/**
 * Scope class dedicated to data collection from a DOM-based environment.
 */
export class WcScope extends Scope {
  public static readonly fileExtensions = [
    '.js',
    '.mjs',
    '.cjs',
    '.jsx',
    '.tsx',
    '.mjsx',
    '.cjsx',
    '.mtsx',
    '.ctsx',
    '.html',
    '.htm'
  ]

  public override name = 'wc' as const
  private runSync = false

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
      WcScope.fileExtensions,
      this.logger
    )

    this.logger.debug('Filtered source files: ' + sourceFiles.map((f) => f.fileName))

    const promises: Promise<void>[] = []

    for (const sourceFile of sourceFiles) {
      // route JS/JSX differently

      if (sourceFile.fileName.endsWith('html')) {
      } else {
      }

      // if JS/JSX
      const resultPromise = this.captureFileMetrics(
        await sourceFile.createSourceFile(),
        instrumentedPackage,
        importMatchers
      )

      // if html
      //

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
    const accumulator = new WcElementAccumulator()

    // TODO make a HTML node handler
    processFile(accumulator, sourceFile, jsxNodeHandlerMap, this.logger)

    this.logger.debug('Pre0filter accumulator contents:', JSON.stringify(accumulator))

    removeIrrelevantImports(accumulator, instrumentedPackage.name)
    this.resolveElementImports(accumulator, importMatchers)

    accumulator.elements.forEach((jsxElement) => {
      const jsImport = accumulator.elementImports.get(jsxElement)

      if (jsImport === undefined) {
        return
      }

      this.capture(
        new ElementMetric(jsxElement, jsImport, instrumentedPackage, this.config, this.logger)
      )
    })
  }

  resolveElementImports(
    accumulator: WcElementAccumulator,
    elementMatchers: JsImportMatcher<JsxElement>[]
  ) {
    accumulator.elements.forEach((jsxElement) => {
      const jsImport = elementMatchers
        .map((elementMatcher) => elementMatcher.findMatch(jsxElement, accumulator.imports))
        .find((jsImport) => jsImport !== undefined)

      if (jsImport === undefined) {
        return
      }

      accumulator.elementImports.set(jsxElement, jsImport)
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
