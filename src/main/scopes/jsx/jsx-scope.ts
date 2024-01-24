/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import getPropertyByPath from 'lodash/get.js'
import { ObjectPath } from 'object-scan'
import path from 'path'
import type * as ts from 'typescript'

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { NoInstallationFoundError } from '../../exceptions/no-installation-found-error.js'
import { findNestedDeps } from '../npm/find-nested-deps.js'
import { getDependencyTree } from '../npm/get-dependency-tree.js'
import { getDirectoryPrefix } from '../npm/get-directory-prefix.js'
import { getPackageData } from '../npm/get-package-data.js'
import { PackageData } from '../npm/interfaces.js'
import { AllImportMatcher } from './import-matchers/all-import-matcher.js'
import { NamedImportMatcher } from './import-matchers/named-import-matcher.js'
import { RenamedImportMatcher } from './import-matchers/renamed-import-matcher.js'
import { DependencyTree, type JsxElementImportMatcher } from './interfaces.js'
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
   * Retrieves a tree rooted at the parent of a package given it's dependencyTree path.
   *
   * @param dependencyTree - The tree to search.
   * @param packagePath - Path to the package to get parent tree for in the dependencyTree.
   * @returns A dependency tree rooted at the package's parent
   * or undefined if the package is already the root.
   */
  getTreePredecessor(
    dependencyTree: DependencyTree,
    packagePath: ObjectPath
  ): DependencyTree | undefined {
    // already at the root
    if (packagePath.length === 0) return undefined

    if (packagePath.length === 2) return { path: [], ...dependencyTree }

    return {
      path: packagePath.slice(0, -2),
      ...getPropertyByPath(dependencyTree, packagePath.slice(0, -2))
    }
  }

  /**
   * Finds all dependency sub-trees rooted at the desired package/version
   * given a bigger dependency tree.
   *
   * @param dependencyTree - The tree to search.
   * @param pkg - Package to find rooted trees for.
   * @returns A (possibly empty) array of dependency trees rooted at the pkg param.
   */
  getPackageTrees(dependencyTree: DependencyTree, pkg: PackageData): DependencyTree[] {
    if (dependencyTree.name === pkg.name && dependencyTree.version === pkg.version) {
      dependencyTree['path'] = []
      return [dependencyTree]
    }

    // TODOASKJOE: this could return more than one
    // how do I know which one is the one that belongs specifically to the file?
    const prefixPackagePaths = findNestedDeps(
      dependencyTree,
      pkg.name,
      ({ value }) => value.version === pkg.version
    )

    if (prefixPackagePaths.length > 0) {
      return prefixPackagePaths.map((path) => ({
        path,
        ...getPropertyByPath(dependencyTree, path)
      }))
    }

    return []
  }

  /**
   * Finds all installed versions of a given package within a dependency tree
   * and returns the direct-most paths.
   *
   * @param dependencyTree - The tree to search.
   * @param pkgName - The tree to search.
   * @returns A (possibly empty) array of paths.
   */
  getInstalledVersionPaths(dependencyTree: DependencyTree, pkgName: string) {
    // find all versions, sort by shortest paths
    const instrumentedInstallPaths = findNestedDeps(dependencyTree, pkgName, () => true).sort(
      (a, b) => {
        if (a.length === b.length) return 0
        return a.length < b.length ? -1 : 1
      }
    )

    if (instrumentedInstallPaths.length > 0) {
      // return all paths with shortest length
      return instrumentedInstallPaths.filter(
        (path) => path.length === instrumentedInstallPaths[0]?.length
      )
    }
    return []
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

    const dependencyTree = await getDependencyTree(this.cwd, this.root, this.logger)

    const filterPromises = sourceFiles.map(async (f) => {
      const prefix = await getDirectoryPrefix(path.dirname(f.fileName), this.logger)
      const prefixPackageData = await getPackageData(prefix, this.root, this.logger)

      // potentially more than one at this point
      //(can't just pick whichever one because as I go upstream, this matters)
      let packageTrees = this.getPackageTrees(dependencyTree, prefixPackageData)

      let instrumentedInstallVersions: string[] | undefined = undefined
      let shortestPathLength: number | undefined = undefined
      do {
        for (const tree of packageTrees) {
          const instrumentedInstallPaths = this.getInstalledVersionPaths(
            tree,
            instrumentedPackage.name
          )
          if (instrumentedInstallPaths.length > 0) {
            const pathsLength = instrumentedInstallPaths[0]?.length ?? 0
            if (shortestPathLength === undefined || pathsLength < shortestPathLength) {
              instrumentedInstallVersions = instrumentedInstallPaths.map(
                (path) => getPropertyByPath(tree, path)['version']
              )
              shortestPathLength = pathsLength
            }
          }
        }
        // did not find, go up one level for all packages
        packageTrees = packageTrees
          .map((tree) => this.getTreePredecessor(dependencyTree, tree['path'] as ObjectPath))
          .filter((tree) => tree !== undefined) as DependencyTree[]
      } while (shortestPathLength === undefined && packageTrees.length > 0)

      if (instrumentedInstallVersions === undefined) {
        throw new NoInstallationFoundError(instrumentedPackage.name)
      }

      return instrumentedInstallVersions.some((version) => version === instrumentedPackage.version)
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
   * @param instrumentedPackage - Name and version of the instrumented package
   * to capture metrics for.
   * @param importMatchers - Matchers instances to use for import-element matching.
   */
  async captureFileMetrics(
    sourceFile: ts.SourceFile,
    instrumentedPackage: PackageData,
    importMatchers: JsxElementImportMatcher[]
  ) {
    const accumulator = new JsxElementAccumulator()

    this.processFile(accumulator, sourceFile)
    this.removeIrrelevantImports(accumulator, instrumentedPackage.name)
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
