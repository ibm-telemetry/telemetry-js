/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Logger } from '../../core/log/logger.js'
import { findInstallersFromTree } from './find-installers-from-tree.js'
import { getDependencyTree } from './get-dependency-tree.js'
import { InstallingPackage } from './interfaces.js'

const cache = new Map<string, Promise<InstallingPackage[]>>()

/**
 * Finds all packages within the project that installed the specified package at the specified
 * version. This is done by finding the root-most project directory containing a node modules folder
 * and running `npm ls` inside of it.
 *
 * If no installers are found after this project directory is searched, an empty array is returned.
 *
 * @param cwd - Current working directory. This must be inside of the root directory. This is an
 * absolute path.
 * @param root - Root-most directory. This is an absolute path.
 * @param packageName - The name of the package for which to search.
 * @param packageVersion - The (optional) version of the package for which to search.
 * @param logger - Logger instance.
 * @returns A possibly empty array of installing packages.
 */
export async function findInstallingPackages(
  cwd: string,
  root: string,
  packageName: string,
  packageVersion: string | null,
  logger: Logger
): Promise<InstallingPackage[]> {
  logger.traceEnter('', 'findInstallingPackages', [packageName, packageVersion, cwd, root])

  const cacheKey = `${cwd} ${root} ${packageName} ${packageVersion}`

  if (cache.has(cacheKey)) {
    logger.debug('findInstallingPackages cache hit for ' + cacheKey)
    const data = await (cache.get(cacheKey) as Promise<InstallingPackage[]>)
    logger.traceExit('', 'findInstallingPackages', data)
    return data
  }

  const getInstallers = async () => {
    const dependencyTree = await getDependencyTree(cwd, root, logger)
    const installers = findInstallersFromTree(dependencyTree, packageName, packageVersion, logger)

    logger.traceExit('', 'findInstallingPackages inner promise', installers)
    return installers
  }

  cache.set(cacheKey, getInstallers())

  const data = await (cache.get(cacheKey) as Promise<InstallingPackage[]>)
  logger.traceExit('', 'findInstallingPackages', data)
  return data
}
