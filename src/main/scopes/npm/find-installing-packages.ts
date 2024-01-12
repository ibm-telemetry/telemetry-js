/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DirectoryEnumerator } from '../../core/directory-enumerator.js'
import { Logger } from '../../core/log/logger.js'
import { runCommand } from '../../core/run-command.js'
import { NoNodeModulesFoundError } from '../../exceptions/no-node-modules-found-error.js'
import { findInstallersFromTree } from './find-installers-from-tree.js'
import { hasNodeModulesFolder } from './has-node-modules-folder.js'
import { InstallingPackage, PackageData } from './interfaces.js'

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
 * @param packageData - The name and exact version of the package to search for.
 * @param logger - Logger instance.
 * @returns A possibly empty array of installing packages.
 */
export async function findInstallingPackages(
  cwd: string,
  root: string,
  packageData: PackageData,
  logger: Logger
): Promise<InstallingPackage[]> {
  logger.traceEnter('', 'findInstallingPackages', [packageData, cwd, root])

  const cacheKey = `${cwd} ${root} ${packageData.name} ${packageData.version}`

  if (cache.has(cacheKey)) {
    logger.debug('findInstallingPackages cache hit for ' + cacheKey)
    const data = await (cache.get(cacheKey) as Promise<InstallingPackage[]>)
    logger.traceExit('', 'findInstallingPackages', data)
    return data
  }

  const getInstallers = async () => {
    const dirs = await new DirectoryEnumerator(logger).find(cwd, root, hasNodeModulesFolder)
    const topMostDir = dirs.pop()

    if (topMostDir === undefined) {
      throw new NoNodeModulesFoundError(cwd, root)
    }

    // Allow this command to try and obtain results even if it exited with a total or partial
    // error
    const commandResult = await runCommand(
      'npm ls --all --json',
      logger,
      { cwd: topMostDir },
      false
    )

    const dependencyTree = JSON.parse(commandResult.stdout)

    const installers = findInstallersFromTree(dependencyTree, packageData, logger)

    logger.traceExit('', 'findInstallingPackages inner promise', installers)
    return installers
  }

  cache.set(cacheKey, getInstallers())

  const data = await (cache.get(cacheKey) as Promise<InstallingPackage[]>)
  logger.traceExit('', 'findInstallingPackages', data)
  return data
}
