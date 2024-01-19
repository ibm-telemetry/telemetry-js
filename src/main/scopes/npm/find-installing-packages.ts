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
 * @param filterFn - Function to filter results by.
 * @param logger - Logger instance.
 * @returns A possibly empty array of installing packages.
 */
export async function findInstallingPackages(
  cwd: string,
  root: string,
  packageName: string,
  filterFn: ({ value }: { value: InstallingPackage }) => boolean,
  logger: Logger
): Promise<InstallingPackage[]> {
  logger.traceEnter('', 'findInstallingPackages', [packageName, filterFn, cwd, root])

  const dependencyTree = await getDependencyTree(cwd, root, logger)
  const installers = findInstallersFromTree(dependencyTree, packageName, filterFn, logger)

  logger.traceExit('', 'findInstallingPackages', installers)
  return installers
}
