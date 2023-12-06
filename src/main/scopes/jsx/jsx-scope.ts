/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { findInstallingPackages } from '../../core/find-installing-packages.js'
import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { getPackageData } from '../npm/get-package-data.js'
import { PackageData } from '../npm/interfaces.js'
import { AllImportMatcher } from './import-matchers/all-import-matcher.js'
import { NamedImportMatcher } from './import-matchers/named-import-matcher.js'
import { RenamedImportMatcher } from './import-matchers/renamed-import-matcher.js'
import { FileTree, type JsxElementImportMatcher } from './interfaces.js'
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
    const fileDirectory: Record<string, string> = {}
    const packageResolutions: Record<string, PackageData> = {}

    const packageResolutionPromises: Promise<void>[] = []
    packageJsonTree.forEach((tree) => {
      packageResolutionPromises.push(this.resolvePackages(tree, packageResolutions))
    })

    await Promise.allSettled(packageResolutionPromises)

    const localPackages = Object.values(packageResolutions)

    const localInstallers = await this.findPkgLocalInstallers(
      instrumentedPackage.name,
      instrumentedPackage.version,
      localPackages
    )

    const promises = sourceFiles.map(async (sourceFile) => {
      const containingDir = findDeepestContainingDirectory(
        sourceFile.fileName,
        packageJsonTree,
        this.logger
      )
      if (containingDir === undefined) return

      fileDirectory[sourceFile.fileName] = containingDir

      if (
        !localInstallers.some(
          (pkg) =>
            pkg.name === packageResolutions[containingDir]?.name &&
            pkg.version === packageResolutions[containingDir]?.version
        )
      ) {
        return
      }

      const accumulator = new JsxElementAccumulator()

      this.processFile(accumulator, sourceFile)
      this.removeIrrelevantImports(accumulator, instrumentedPackage.name)
      this.resolveElementImports(accumulator, importMatchers)
      await this.resolveInvokers(
        accumulator,
        sourceFile.fileName,
        fileDirectory,
        packageResolutions
      )

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
  @Trace({
    argFormatter: (arg) =>
      arg instanceof JsxElementAccumulator ? '[JsxElementAccumulator]' : arg?.fileName
  })
  processFile(accumulator: JsxElementAccumulator, sourceFile: ts.SourceFile) {
    const handler = new SourceFileHandler(accumulator, jsxNodeHandlerMap, this.logger)

    handler.handle(sourceFile, sourceFile)
  }

  /**
   * Given an accumulator containing imports, removes all imports
   * that don't belong to the given instrumented package .
   *
   * @param accumulator - The accumulator in which the imports are stored.
   * @param instrumentedPackageName - Name of instrumented package.
   */
  removeIrrelevantImports(accumulator: JsxElementAccumulator, instrumentedPackageName: string) {
    const imports = accumulator.imports.filter((jsxImport) => {
      return jsxImport.path.startsWith(instrumentedPackageName)
    })

    accumulator.imports.splice(0, accumulator.imports.length, ...imports)
  }

  /**
   * Given an accumulator containing imports and elements,
   *  populates the accumulators' `elementImports`
   * with the corresponding element-import matches.
   *
   * @param accumulator - The accumulator in which the imports and elements are stored.
   * @param elementMatchers - List of pre-instantiated JsxElementImportMatchers
   * to match elements against.
   */
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
   * @param fileDirectory - Cached mapping of files to their containing package directory.
   * @param packageResolutions - Cached mapping of package directories to the resolved
   * package name and version.
   */
  async resolveInvokers(
    accumulator: JsxElementAccumulator,
    sourceFilePath: string,
    fileDirectory: Record<string, string>,
    packageResolutions: Record<string, PackageData>
  ) {
    const packageDir = fileDirectory[sourceFilePath]
    if (packageDir === undefined) return
    const containingPackageData = packageResolutions[packageDir]

    if (containingPackageData === undefined) return

    accumulator.elements.forEach((jsxElement) => {
      accumulator.elementInvokers.set(jsxElement, containingPackageData.name)
    })
  }

  /**
   * Resolves the PackageData for all file directories contained in the given FileTree
   * and stores them in the packageResolutions mapper.
   *
   * @param tree - FileTree to resolve packages for.
   * @param packageResolutions - Map to store PackageData given a file directory.
   * @returns Void promise.
   */
  async resolvePackages(tree: FileTree, packageResolutions: Record<string, PackageData>) {
    try {
      packageResolutions[tree.path] = await getPackageData(tree.path, this.logger)
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err)
      } else {
        this.logger.error(String(err))
      }
    }
    const promises: Promise<void>[] = []
    tree.children.forEach((child) => {
      ;(async () => {
        promises.push(this.resolvePackages(child, packageResolutions))
      })()
    })
    return new Promise<void>((resolve) => {
      ;(() => Promise.allSettled(promises).then(() => resolve()))()
    })
  }

  // TODOASKJOE: boiii is this expensive ... 🥵
  /**
   * Find the list of local packages that installed (nested or not) a given package
   * at a specific version.
   *
   * @param pkgName - Name of package to find.
   * @param pkgVersion - Version of package to find.
   * @param localPackages - Precomputed list of local packages.
   * @returns List of local installers for the given package name/version.
   */
  async findPkgLocalInstallers(pkgName: string, pkgVersion: string, localPackages: PackageData[]) {
    const localInstallers: PackageData[] = []
    const installingPackages = await findInstallingPackages(
      pkgName,
      pkgVersion,
      this.cwd,
      this.root,
      this.logger
    )
    const promises: Promise<void>[] = []
    installingPackages.forEach((pkg) => {
      ;(async () => {
        if (
          !localPackages.some(
            (localPkg) => localPkg.name === pkg.name && localPkg.version === pkg.version
          )
        ) {
          promises.push(
            new Promise<void>((resolve) => {
              ;(() => {
                this.findPkgLocalInstallers(pkg.name, pkg.version, localPackages).then(
                  (installers) => {
                    localInstallers.push(...installers)
                    resolve()
                  }
                )
              })()
            })
          )
        } else {
          localInstallers.push(pkg)
        }
      })()
    })
    await Promise.allSettled(promises)
    return localInstallers
  }
}
