/*
 * Copyright IBM Corp. 2023, 2025
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
import { WcElementSideEffectImportMatcher } from './import-matchers/wc-element-side-effect-import-matcher.js'
import { type WcElement } from './interfaces.js'
import { ParsedFile } from './interfaces.js'
import { ElementMetric } from './metrics/element-metric.js'
import { buildAbsolutePath, buildIndexImportsMap } from './utils/build-index-imports-map.js'
import { getWcPrefix } from './utils/get-wc-prefix.js'
import { isJsxElement } from './utils/is-jsx-element.js'
import { isWcElement } from './utils/is-wc-element.js'
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
  private importsPerFile = new Map<string, JsImport[]>()
  private packageIndexMap: Map<string, string[]> = new Map()

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

    // Build up map containing contents of `index.js` files
    this.packageIndexMap = await buildIndexImportsMap(
      this.root,
      instrumentedPackage.name,
      this.logger
    )

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
        importMatchers
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
    // problem is that the accumulator resets in every file
    // maybe have to create a new map to ensure that it captures all the imports coming from other files?
    // or maybe just go into those files?

    // make html files go dead last
    // create a map for files and their respective imports
    // when handling a script node, check the path its importing and see what imports it gets from the map
    // add those imports to the current accumulator
    const accumulator = new WcElementAccumulator()

    processFile(accumulator, sourceFile, wcNodeHandlerMap, this.logger)

    this.logger.debug('Pre-filter accumulator contents:', JSON.stringify(accumulator))

    // get all the imports that an index.js file is importing from a component
    // e.g. @carbon/web-components/es/components/button/index.js
    this.resolveIndexImports(accumulator, instrumentedPackage.name)

    this.logger.debug('Post resolve index accumulator contents:', JSON.stringify(accumulator))

    removeIrrelevantImports(accumulator, instrumentedPackage.name)

    this.logger.debug('This is the sourcefile', sourceFile.fileName ?? '')
    this.logger.debug('This is the current imports', JSON.stringify(accumulator.imports))

    this.logger.debug('This is the root', this.root)

    // save file imports to super map
    this.importsPerFile.set(sourceFile.fileName ?? '', accumulator.imports)

    this.logger.debug(
      'Super import map',
      JSON.stringify(Object.fromEntries(this.importsPerFile), null, 2)
    )

    if (accumulator.scriptSources) {
      this.resolveLinkedImports(accumulator)
    }

    this.resolveElementImports(accumulator, importMatchers)

    this.logger.debug('Post-filter accumulator contents:', JSON.stringify(accumulator))

    accumulator.elements.forEach((element) => {
      const jsImport = accumulator.elementImports.get(element)

      if (jsImport === undefined) {
        return
      }

      this.logger.debug('Element to be captured is', JSON.stringify(element))

      // type guarding was needed
      if (isJsxElement(element) || isWcElement(element)) {
        this.capture(
          new ElementMetric(element, jsImport, instrumentedPackage, this.config, this.logger)
        )
      }
    })
  }

  resolveIndexImports(accumulator: WcElementAccumulator, instrumentedPackage: string) {
    const newImports: JsImport[] = []

    for (const jsImport of accumulator.imports) {
      if (jsImport.path.endsWith('index.js') || jsImport.path.endsWith('index')) {
        this.logger.debug('The import is', JSON.stringify(jsImport))

        const componentPath = buildAbsolutePath(this.root, instrumentedPackage, jsImport.name)
        const indexImports = this.packageIndexMap.get(componentPath) ?? []

        this.logger.debug('The built absolute path is', JSON.stringify(componentPath))
        this.logger.debug('The index imports are', JSON.stringify(indexImports))

        for (const importPath of indexImports) {
          const segments = importPath.split('/')
          const fileName = segments[segments.length - 1]?.replace(/\.js$/, '') ?? ''
          const prefix = getWcPrefix(importPath)
          const componentName = prefix === '' ? `${prefix}-${fileName}` : fileName

          newImports.push({
            name: componentName,
            path: instrumentedPackage,
            isDefault: false,
            isAll: false,
            isSideEffect: true
          })
        }
      } else {
        newImports.push(jsImport)
      }
    }

    accumulator.imports = newImports
  }

  resolveLinkedImports(accumulator: WcElementAccumulator) {
    const mergedImports = [...accumulator.imports]

    for (const scriptSource of accumulator.scriptSources) {
      const absolutePath = this.findByRelativePath(scriptSource)
      const scriptImports = this.importsPerFile.get(absolutePath)

      this.logger.debug('The scriptImports are', JSON.stringify(scriptImports))

      this.logger.debug('Relative path', scriptSource)
      this.logger.debug('Absolute path', absolutePath)

      if (scriptImports) {
        mergedImports.push(...scriptImports)
        accumulator.imports = mergedImports
      }
    }
  }

  resolveElementImports(
    accumulator: WcElementAccumulator,
    elementMatchers: JsImportMatcher<WcElement | JsxElement>[]
  ) {
    accumulator.elements.forEach((element) => {
      const jsImport = elementMatchers
        .map((elementMatcher) => {
          this.logger.debug(
            'Type is ',
            elementMatcher.elementType,
            'element is',
            JSON.stringify(element)
          )

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

      // TODO: for some reason web components inside a JSX/react component isn't being added to the
      // elementsImports, BUT they are inside the imports array. super weird.

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

  /**
   * Given a relative path, and the root directory, resolves the relative path
   * to an absolute path and returns the matching value from the map.
   *
   * @param absolutePathMap - Map with absolute paths as keys.
   * @param relativePath - Relative path to resolve and match.
   * @param rootDir - Root directory to resolve the relative path against.
   * @returns The matched value from the map or undefined if not found.
   */
  findByRelativePath(relativePath: string): string {
    return path.normalize(path.resolve(this.root, relativePath))
  }
}
