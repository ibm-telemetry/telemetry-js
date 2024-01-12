/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { NoNodeModulesFoundError } from '../exceptions/no-node-modules-found-error.js'
import { findInstallersFromTree } from '../scopes/npm/find-installers-from-tree.js'
import { hasNodeModulesFolder } from '../scopes/npm/has-node-modules-folder.js'
import { InstallingPackage, PackageData } from '../scopes/npm/interfaces.js'
import { DirectoryEnumerator } from './directory-enumerator.js'
import { Logger } from './log/logger.js'
import { runCommand } from './run-command.js'

/**
 * Finds all packages within the project that installed the specified package at the specified
 * version. This is done by starting at the current directory and traversing up the directory
 * structure until an `npm ls` command on one of those directories returns a non-empty list of
 * installers.
 *
 * If no installers were found after the root-most project directory was searched, an empty array
 * is returned.
 *
 * @param cwd - Current working directory. This must be inside of the root directory. This is an
 * absolute path.
 * @param root - Root-most directory. This is an absolute path.
 * @param packageData - The name  and exact version of the package to search for.
 * @param logger - Logger instance.
 * @returns A possibly empty array of installing packages.
 */
export async function findInstallingPackages(
  cwd: string,
  root: string,
  packageData: PackageData,
  logger: Logger
): Promise<InstallingPackage[]> {
  logger.traceEnter('', 'findInstallingPackages', [cwd, root, packageData])
  const dirs = await new DirectoryEnumerator(logger).find(cwd, root, hasNodeModulesFolder)
  const topMostDir = dirs.pop()

  if (topMostDir === undefined) {
    throw new NoNodeModulesFoundError(cwd, root)
  }

  // Allow this command to try and obtain results even if it exited with a total or partial error
  const result = await runCommand('npm ls --all --json', logger, { cwd: topMostDir }, false)

  const dependencyTree = JSON.parse(result.stdout)

  const installers = findInstallersFromTree(dependencyTree, packageData, logger)

  logger.traceExit('', 'findInstallingPackages', installers)
  return installers
}
