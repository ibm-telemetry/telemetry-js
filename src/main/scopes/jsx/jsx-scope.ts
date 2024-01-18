/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import type * as ts from 'typescript'

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { findInstallingPackages } from '../npm/find-installing-packages.js'
import { findNestedDeps } from '../npm/find-nested-deps.js'
import { getDependencyTree } from '../npm/get-dependency-tree.js'
import { getDirectoryPrefix } from '../npm/get-directory-prefix.js'
import { getPackageData } from '../npm/get-package-data.js'
import { PackageData } from '../npm/interfaces.js'
import { AllImportMatcher } from './import-matchers/all-import-matcher.js'
import { NamedImportMatcher } from './import-matchers/named-import-matcher.js'
import { RenamedImportMatcher } from './import-matchers/renamed-import-matcher.js'
import { type JsxElementImportMatcher } from './interfaces.js'
import { JsxElementAccumulator } from './jsx-element-accumulator.js'
import { jsxNodeHandlerMap } from './maps/jsx-node-handler-map.js'
import { ElementMetric } from './metrics/element-metric.js'
import { SourceFileHandler } from './node-handlers/source-file-handler.js'
import { getTrackedSourceFiles } from './utils/get-tracked-source-files.js'

/**
 * Scope class dedicated to data collection from a jsx environment.
 */
export class JsxScope extends Scope {
  public override name = 'jsx' as const
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
      new AllImportMatcher(),
      new NamedImportMatcher(),
      new RenamedImportMatcher()
    ]
    const instrumentedPackage = await getPackageData(this.cwd, this.cwd, this.logger)
    const sourceFiles = await this.findRelevantSourceFiles(instrumentedPackage)

    this.logger.debug('Filtered source files: ' + sourceFiles.map((f) => f.fileName))

    const promises: Promise<void>[] = []

    for (const sourceFile of sourceFiles) {
      const resultPromise = this.captureFileMetrics(
        sourceFile,
        instrumentedPackage.name,
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
   * Finds tracked source files and then filters them based on ones that appear in a  project which
   * depends on the in-context instrumented package/version.
   *
   * @param instrumentedPackage - Data about the instrumented package to use during filtering.
   * @returns A (possibly empty) array of source files.
   */
  async findRelevantSourceFiles(instrumentedPackage: PackageData) {
    const sourceFiles = await getTrackedSourceFiles(this.root, this.logger)
    const installingPackages = await findInstallingPackages(
      this.cwd,
      this.root,
      instrumentedPackage.name,
      null, // find ALL versions
      this.logger
    )

    const dependencyTree = await getDependencyTree(this.cwd, this.root, this.logger)

    const filterPromises = sourceFiles.map(async (f) => {
      const prefix = await getDirectoryPrefix(path.dirname(f.fileName), this.logger)
      const prefixPackageData = await getPackageData(prefix, this.root, this.logger)

      // prefixPackageData is an installer of the instrumented package
      const prefixInstaller = installingPackages.find((pkg) => pkg.name === prefixPackageData.name)
      if (prefixInstaller !== undefined) {
        const installedInstrumentedVersion = prefixInstaller.dependencies.find(
          (d) => d.name === instrumentedPackage.name
        )?.version
        // if the package has the same instrumented version installed capture metrics, else skip
        return installedInstrumentedVersion === instrumentedPackage.version
      }

      const prefixPackageDataPaths = findNestedDeps(
        dependencyTree,
        prefixPackageData.name,
        ({ value }) => value.version === prefixPackageData.version
      ).map((path) => [dependencyTree['name'], ...path].join('.'))

      // a "parent" of the file's package has installed
      // the instrumented package at a different version
      const differentVersionInstalledUpstream = installingPackages.some(
        (pkg) =>
          pkg.dependencies.find((p) => p.name === instrumentedPackage.name)?.version !==
            instrumentedPackage.version &&
          prefixPackageDataPaths.some((dataPath) => dataPath.includes(pkg.path.join('.')))
      )

      if (differentVersionInstalledUpstream) {
        return false
      }

      // a dependency has installed a different version of the instrumented package
      const differentVersionInstalledDownstream = installingPackages.some(
        (pkg) =>
          pkg.dependencies.find((p) => p.name === instrumentedPackage.name)?.version !==
            instrumentedPackage.version &&
          prefixPackageDataPaths.some((dataPath) =>
            pkg.path.join('.').includes(`${dataPath}.dependencies`)
          )
      )

      // if there is a different version (of the instrumented package) installed downstream
      // we do not want to capture, unless there is an exact version installed aswell.
      if (differentVersionInstalledDownstream) {
        // a dependency has installed an exact version of the instrumented package
        const exactVersionInstalledDownstream = installingPackages.some(
          (pkg) =>
            pkg.dependencies.find((p) => p.name === instrumentedPackage.name)?.version ===
              instrumentedPackage.version &&
            prefixPackageDataPaths.some((dataPath) =>
              pkg.path.join('.').includes(`${dataPath}.dependencies`)
            )
        )
        return exactVersionInstalledDownstream
      }
      // if no exception condition is met, we want to capture
      return true
    })
    const filterData = await Promise.all(filterPromises)

    return sourceFiles.filter((_, index) => {
      return filterData[index]
    })
  }

  /**
   * Generates metrics for all discovered instrumented jsx elements found
   * in the supplied SourceFile node.
   *
   * @param sourceFile - The sourcefile node to generate metrics for.
   * @param instrumentedPackageName - Name of the instrumented package to capture metrics for.
   * @param importMatchers - Matchers instances to use for import-element matching.
   */
  async captureFileMetrics(
    sourceFile: ts.SourceFile,
    instrumentedPackageName: string,
    importMatchers: JsxElementImportMatcher[]
  ) {
    const accumulator = new JsxElementAccumulator()

    this.processFile(accumulator, sourceFile)
    this.removeIrrelevantImports(accumulator, instrumentedPackageName)
    this.resolveElementImports(accumulator, importMatchers)
    await this.resolveInvokers(accumulator, sourceFile.fileName)

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
      return (
        jsxImport.path === instrumentedPackageName ||
        jsxImport.path.startsWith(`${instrumentedPackageName}/`)
      )
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
