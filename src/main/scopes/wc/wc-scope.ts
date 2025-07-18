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
import { type WcElement } from './interfaces.js'
import { type JsxElement } from '../jsx/interfaces.js'
import { ElementMetric } from './metrics/element-metric.js'
import { getPackageData } from '../npm/get-package-data.js'
import type { PackageData } from '../npm/interfaces.js'
import { WcElementAccumulator } from './wc-element-accumulator.js'
import { wcNodeHandlerMap } from './wc-node-handler-map.js'
import { ParsedFile } from './interfaces.js'
import { isJsxElement } from './utils/is-jsx-element.js'
import { isWcElement } from './utils/is-wc-element.js'
import { WcElementSideEffectImportMatcher } from './import-matchers/wc-element-side-effect-import-matcher.js'

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
      new JsxElementRenamedImportMatcher(),
      new WcElementSideEffectImportMatcher()
      // maybe HtmlElementCdnImportMatcher() TODO
    ] as JsImportMatcher<JsxElement | WcElement>[]

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
      const resultPromise = this.captureFileMetrics(
        await sourceFile.createSourceFile(),
        instrumentedPackage,
        importMatchers // NEXT THING TO DO
      )

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
    sourceFile: ParsedFile, // ts.SourceFile
    instrumentedPackage: PackageData,
    importMatchers: JsImportMatcher<WcElement | JsxElement>[]
  ) {
    const accumulator = new WcElementAccumulator()

    // TODO make a HTML node handler
    processFile(accumulator, sourceFile, wcNodeHandlerMap, this.logger)

    this.logger.debug('Pre-filter accumulator contents:', JSON.stringify(accumulator))

    removeIrrelevantImports(accumulator, instrumentedPackage.name)
    this.resolveElementImports(accumulator, importMatchers)

    accumulator.elements.forEach((element) => {
      const jsImport = accumulator.elementImports.get(element)

      if (jsImport === undefined) {
        return
      }

      // type guarding was needed
      if (isJsxElement(element) || isWcElement(element)) {
        this.capture(
          new ElementMetric(element, jsImport, instrumentedPackage, this.config, this.logger)
        )
      }
    })
  }

  resolveElementImports(
    accumulator: WcElementAccumulator,
    elementMatchers: JsImportMatcher<WcElement | JsxElement>[]
  ) {
    accumulator.elements.forEach((element) => {
      const jsImport = elementMatchers
        .map((elementMatcher) => {
          if (elementMatcher.elementType === 'jsx' && isJsxElement(element)) {
            return elementMatcher.findMatch(element, accumulator.imports)
          }

          if (elementMatcher.elementType === 'wc' && isWcElement(element)) {
            return elementMatcher.findMatch(element, accumulator.imports)
          }
          return undefined
        })
        .find((jsImport) => jsImport !== undefined)

      if (jsImport === undefined) {
        return
      }

      accumulator.elementImports.set(element, jsImport)
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
