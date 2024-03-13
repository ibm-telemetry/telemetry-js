/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import getPropertyByPath = require('lodash/get.js')
import * as path from 'node:path'

import { ObjectPath } from 'object-scan'

import { getTrackedSourceFiles } from '../../core/get-tracked-source-files.js'
import { Logger } from '../../core/log/logger.js'
import { NoInstallationFoundError } from '../../exceptions/no-installation-found-error.js'
import { getDependencyTree } from '../npm/get-dependency-tree.js'
import { getDirectoryPrefix } from '../npm/get-directory-prefix.js'
import { getInstalledVersionPaths } from '../npm/get-installed-version-paths.js'
import { getPackageData } from '../npm/get-package-data.js'
import { getPackageTrees } from '../npm/get-package-trees.js'
import { getTreePredecessor } from '../npm/get-tree-predecessor.js'
import { DependencyTree, PackageData } from '../npm/interfaces.js'

/**
 * Finds tracked source files and then filters them based on ones that appear in a  project which
 * depends on the in-context instrumented package/version.
 *
 * @param instrumentedPackage - Data about the instrumented package to use during filtering.
 * @param cwd - Current working directory. This must be inside of the root directory. This is an
 * absolute path.
 * @param root - Root-most directory. This is an absolute path.
 * @param fileExtensions - List of file extensions to capture metrics for.
 * @param logger - Logger instance.
 * @returns A (possibly empty) array of source files.
 */
export async function findRelevantSourceFiles(
  instrumentedPackage: PackageData,
  cwd: string,
  root: string,
  fileExtensions: string[],
  logger: Logger
) {
  logger.traceEnter('', 'findRelevantSourceFiles', [instrumentedPackage, cwd, root, fileExtensions])
  const sourceFiles = await getTrackedSourceFiles(root, logger, fileExtensions)

  const dependencyTree = await getDependencyTree(cwd, root, logger)

  const filterPromises = sourceFiles.map(async (f) => {
    const prefix = await getDirectoryPrefix(path.dirname(f.fileName), logger)
    const prefixPackageData = await getPackageData(prefix, root, logger)

    let packageTrees = getPackageTrees(dependencyTree, prefixPackageData)

    let instrumentedInstallVersions: string[] | undefined = undefined
    let shortestPathLength: number | undefined = undefined
    do {
      for (const tree of packageTrees) {
        const instrumentedInstallPaths = getInstalledVersionPaths(tree, instrumentedPackage.name)
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
        .map((tree) => getTreePredecessor(dependencyTree, tree['path'] as ObjectPath))
        .filter((tree) => tree !== undefined) as DependencyTree[]
    } while (shortestPathLength === undefined && packageTrees.length > 0)

    if (instrumentedInstallVersions === undefined) {
      throw new NoInstallationFoundError(instrumentedPackage.name)
    }

    return instrumentedInstallVersions.some((version) => version === instrumentedPackage.version)
  })
  const filterData = await Promise.all(filterPromises)

  const results = sourceFiles.filter((_, index) => {
    return filterData[index]
  })

  logger.traceEnter('', 'findRelevantSourceFiles', results)
  return results
}
