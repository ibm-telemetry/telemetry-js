/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'node:path'

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { findRelevantSourceFiles } from '../js/find-relevant-source-files.js'
import type { JsImport, JsImportMatcher } from '../js/interfaces.js'
import { processFile } from '../js/process-file.js'
import { removeIrrelevantImports } from '../js/remove-irrelevant-imports.js'
import { JsxElementAllImportMatcher } from '../jsx/import-matchers/jsx-element-all-import-matcher.js'
import { JsxElementNamedImportMatcher } from '../jsx/import-matchers/jsx-element-named-import-matcher.js'
import { JsxElementRenamedImportMatcher } from '../jsx/import-matchers/jsx-element-renamed-import-matcher.js'
import { type JsxElement } from '../jsx/interfaces.js'
import { getPackageData } from '../npm/get-package-data.js'
import type { PackageData } from '../npm/interfaces.js'
import { WcElementCdnImportMatcher } from './import-matchers/wc-element-cdn-import-matcher.js'
import { WcElementSideEffectImportMatcher } from './import-matchers/wc-element-side-effect-import-matcher.js'
import type { CdnImportMatcher } from './interfaces.js'
import { type WcElement } from './interfaces.js'
import { ParsedFile } from './interfaces.js'
import { ElementMetric } from './metrics/element-metric.js'
import {
  buildComponentIndexAbsolutePath,
  buildIndexImportsMap,
  resolveComponentsDir
} from './utils/build-index-imports-map.js'
import { isCdnLink } from './utils/is-cdn-link.js'
import { isJsxElement } from './utils/is-jsx-element.js'
import { isWcElement } from './utils/is-wc-element.js'
import { parseCdnImport } from './utils/parse-cdn-import.js'
import { WcElementAccumulator } from './wc-element-accumulator.js'
import { wcNodeHandlerMap } from './wc-node-handler-map.js'

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
  private runSync = true
  private readonly jsImportsPerFile = new Map<string, JsImport[]>()
  private packageIndexMap: Map<string, string[]> = new Map()
  private componentsDir: string = ''

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
   * Generates metrics for all discovered instrumented wc and jsx elements found
   * in the current working directory's project.
   */
  @Trace()
  async captureAllMetrics(): Promise<void> {
    const jsImportMatchers = [
      new JsxElementAllImportMatcher(),
      new JsxElementNamedImportMatcher(),
      new JsxElementRenamedImportMatcher(),
      new WcElementSideEffectImportMatcher()
    ] as JsImportMatcher<JsxElement | WcElement>[]

    const cdnImportMatchers = [new WcElementCdnImportMatcher()] as CdnImportMatcher<WcElement>[]

    const instrumentedPackage = await getPackageData(this.cwd, this.cwd, this.logger)
    const sourceFiles = await findRelevantSourceFiles(
      instrumentedPackage,
      this.cwd,
      this.root,
      WcScope.fileExtensions,
      this.logger
    )

    // build package component directory
    this.componentsDir = (await resolveComponentsDir(this.root, instrumentedPackage.name)) ?? ''

    // Build up map containing contents of `index.js` files
    this.packageIndexMap = await buildIndexImportsMap(this.componentsDir, this.logger)

    this.logger.debug(
      'this is the package index map',
      JSON.stringify(Object.fromEntries(this.packageIndexMap), null, 2)
    )

    // Sort html files to the end
    sourceFiles.sort(
      (a, b) => Number(a.fileName.endsWith('.html')) - Number(b.fileName.endsWith('.html'))
    )

    this.logger.debug('Filtered source files: ' + sourceFiles.map((f) => f.fileName))

    const promises: Promise<void>[] = []

    for (const sourceFile of sourceFiles) {
      const resultPromise = this.captureFileMetrics(
        await sourceFile.createSourceFile(),
        instrumentedPackage,
        jsImportMatchers,
        cdnImportMatchers
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
   * Generates metrics for all discovered instrumented wc or jsx elements found
   * in the supplied SourceFile node.
   *
   * @param sourceFile - The sourcefile node to generate metrics for.
   * @param instrumentedPackage - Name and version of the instrumented package
   * to capture metrics for.
   * @param jsImportMatchers - Matchers instances to use for js import to element matching.
   * @param cdnImportMatchers - Matchers instances to use for cdn import to element matching.
   */
  async captureFileMetrics(
    sourceFile: ParsedFile, // ts.SourceFile
    instrumentedPackage: PackageData,
    jsImportMatchers: JsImportMatcher<WcElement | JsxElement>[],
    cdnImportMatchers: CdnImportMatcher<WcElement>[]
  ) {
    const accumulator = new WcElementAccumulator()

    processFile(accumulator, sourceFile, wcNodeHandlerMap, this.logger)

    this.logger.debug('Pre-filter accumulator contents:', JSON.stringify(accumulator))

    removeIrrelevantImports(accumulator, instrumentedPackage.name)

    // get all the imports that an index.js file is importing from a component
    // e.g. @carbon/web-components/es/components/button/index.js
    this.resolveIndexImports(accumulator, instrumentedPackage.name)

    this.logger.debug('Post resolve index accumulator contents:', JSON.stringify(accumulator))

    this.logger.debug('This is the sourcefile', sourceFile.fileName ?? '')
    this.logger.debug('This is the current jsImports', JSON.stringify(accumulator.jsImports))

    this.logger.debug('This is the root', this.root)

    // save file imports to super map
    this.jsImportsPerFile.set(sourceFile.fileName ?? '', accumulator.jsImports)

    this.logger.debug(
      'Super import map',
      JSON.stringify(Object.fromEntries(this.jsImportsPerFile), null, 2)
    )

    if (accumulator.scriptSources.length > 0) {
      this.resolveLinkedImports(accumulator, instrumentedPackage.name)
    }

    this.resolveElementImports(accumulator, jsImportMatchers, cdnImportMatchers)

    this.logger.debug('Post-filter accumulator contents:', JSON.stringify(accumulator))

    accumulator.elements.forEach((element) => {
      const componentImport = accumulator.elementImports.get(element)

      if (componentImport === undefined) {
        return
      }

      this.logger.debug('Element to be captured is', JSON.stringify(element))

      // type guarding was needed
      if (isJsxElement(element) || isWcElement(element)) {
        this.capture(
          new ElementMetric(element, componentImport, instrumentedPackage, this.config, this.logger)
        )
      }
    })
  }

  resolveIndexImports(accumulator: WcElementAccumulator, instrumentedPackage: string) {
    const newImports: JsImport[] = []

    for (const jsImport of accumulator.jsImports) {
      if (jsImport.path.endsWith('index.js') || jsImport.path.endsWith('index')) {
        this.logger.debug('The import is', JSON.stringify(jsImport))

        const componentPath = buildComponentIndexAbsolutePath(this.componentsDir, jsImport.name)
        const indexImports = this.packageIndexMap.get(componentPath) ?? []

        this.logger.debug('The built absolute path is', JSON.stringify(componentPath))
        this.logger.debug('The index imports are', JSON.stringify(indexImports))

        for (const importPath of indexImports) {
          const segments = importPath.split('/')
          const componentName = segments[segments.length - 1]?.replace(/\.js$/, '') ?? ''
          const indexImport: JsImport = {
            name: componentName,
            path: instrumentedPackage,
            isDefault: false,
            isAll: false,
            isSideEffect: true
          }
          if (jsImport.hasOwnProperty('prefix')) {
            indexImport.prefix = jsImport.prefix
          }
          newImports.push(indexImport)
        }
      } else {
        newImports.push(jsImport)
      }
    }

    accumulator.jsImports = newImports
  }

  resolveLinkedImports(accumulator: WcElementAccumulator, instrumentedPackage: string) {
    const mergedJsImports = [...accumulator.jsImports]

    for (const scriptSource of accumulator.scriptSources) {
      if (isCdnLink(scriptSource)) {
        const cdnImport = parseCdnImport(scriptSource)
        this.logger.debug('The CDN import is', JSON.stringify(cdnImport))
        if (cdnImport.package === instrumentedPackage) {
          this.logger.debug('CDN import matches instrumented package')
          accumulator.cdnImports.push(cdnImport)
        }
      } else {
        const absolutePath = this.findByRelativePath(scriptSource)
        const scriptImports = this.jsImportsPerFile.get(absolutePath)

        this.logger.debug('The scriptImports are', JSON.stringify(scriptImports))

        this.logger.debug('Relative path', scriptSource)
        this.logger.debug('Absolute path', absolutePath)

        if (scriptImports) {
          mergedJsImports.push(...scriptImports)
          accumulator.jsImports = mergedJsImports
        }
      }
    }
  }

  matchCdnImport(
    element: WcElement,
    cdnImportMatchers: CdnImportMatcher<WcElement>[],
    accumulator: WcElementAccumulator
  ) {
    const cdnImport = cdnImportMatchers
      .map((elementMatcher) => {
        this.logger.debug(
          'Type is ',
          elementMatcher.elementType,
          'element is',
          JSON.stringify(element)
        )
        return elementMatcher.findMatch(element, accumulator.cdnImports)
      })
      .find((cdnImport) => cdnImport !== undefined)
    if (cdnImport === undefined) {
      return
    }
    accumulator.elementImports.set(element, cdnImport)
  }

  resolveElementImports(
    accumulator: WcElementAccumulator,
    jsImportMatchers: JsImportMatcher<WcElement | JsxElement>[],
    cdnImportMatchers: CdnImportMatcher<WcElement>[]
  ) {
    accumulator.elements.forEach((element) => {
      const elemImport = jsImportMatchers
        .map((elementMatcher) => {
          this.logger.debug(
            'Type is ',
            elementMatcher.elementType,
            'element is',
            JSON.stringify(element)
          )

          if (elementMatcher.elementType === 'jsx' && isJsxElement(element)) {
            return elementMatcher.findMatch(element, accumulator.jsImports)
          }

          if (elementMatcher.elementType === 'wc' && isWcElement(element)) {
            const matchedImport = elementMatcher.findMatch(element, accumulator.jsImports)
            if (matchedImport !== undefined) {
              return matchedImport
            }
            return this.matchCdnImport(element, cdnImportMatchers, accumulator)
          }
          return undefined
        })
        .find((jsImport) => jsImport !== undefined)

      if (elemImport === undefined) {
        return
      }

      accumulator.elementImports.set(element, elemImport)
    })
  }

  /**
   * **For testing purposes only.**
   * Makes the WcScope collection run "synchronously" (one source file at a time). Defaults to
   * `false`.
   *
   * @param runSync - Boolean of whether or not to run synchronously.
   */
  setRunSync(runSync: boolean) {
    this.runSync = runSync
  }

  /**
   * Given a relative path, resolves the relative path to an absolute path.
   *
   * @param relativePath - Relative path to resolve.
   * @returns The absolute path.
   */
  findByRelativePath(relativePath: string): string {
    return path.normalize(path.resolve(this.root, relativePath))
  }
}
