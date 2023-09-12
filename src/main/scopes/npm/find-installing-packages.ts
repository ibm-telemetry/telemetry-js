/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { exec } from '../../core/exec.js'
import { getProjectRoot } from '../../core/get-project-root.js'
import { findInstallersFromTree } from './find-installers-from-tree.js'
import { findScannableDirectories } from './find-scannable-directories.js'
import { type InstallingPackage } from './interfaces.js'

/**
 * Finds all packages within the project that installed the specified package at the specified
 * version. This is done by starting at the current directory and traversing up the directory
 * structure until an `npm ls` command on one of those directories returns a non-empty list of
 * installers.
 *
 * If no installers were found after the root-post project directory was searched, an empty array is
 * returned.
 *
 * @param packageName - The name of the package to search for.
 * @param packageVersion - The exact version of the package to search for.
 * @returns A possibly empty array of installing packages.
 */
export async function findInstallingPackages(
  packageName: string,
  packageVersion: string
): Promise<InstallingPackage[]> {
  const cwd = process.cwd()
  const root = await getProjectRoot()
  const dirs = await findScannableDirectories(cwd, root)

  let installers: InstallingPackage[] = []

  for (const d of dirs) {
    const dependencyTree = JSON.parse(await exec('npm ls --all --json', { cwd: d }))

    installers = findInstallersFromTree(dependencyTree, packageName, packageVersion)

    if (installers.length > 0) {
      break
    }
  }

  return installers
}
