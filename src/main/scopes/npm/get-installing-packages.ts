/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { access } from 'node:fs/promises'

import getPropertyByPath from 'lodash/get.js'
import objectScan from 'object-scan'
import path from 'path'

import { exec } from '../../core/exec.js'
import { type PackageData } from './get-package-data.js'
import { getProjectRoot } from './get-project-root.js'

interface InstallingPackage extends PackageData {
  dependencies: PackageData[]
}

/**
 * Given a directory path, determines if a node_modules folder exists directly inside of it.
 *
 * @param dirPath - The path to the directory to query.
 * @returns True if node_modules folder exists, False otherwise.
 */
async function hasNodeModulesFolder(dirPath: string) {
  let err

  try {
    await access(path.join(dirPath, 'node_modules'))
  } catch (e) {
    err = e
    // TODO: log this for good measure
  }

  return err === undefined
}

/**
 * Given a package name and version, finds the package(s) that installed it.
 *
 * @param packageName - The name of the package to query.
 * @param packageVersion - The exact semantic version string of the package to query.
 * @returns A list of dependent package objects.
 */
export async function getInstallingPackages(
  packageName: string,
  packageVersion: string
): Promise<InstallingPackage[]> {
  /*
   * Nested dependency considerations:
   *
   * Given the following hierarchy (assume "b" is an instrumented package):
   *
   * "Root"
   *  └── "a"
   *       └── "b".
   *
   * When "b" gets installed for the first time in the project (as a part of "a"), it will be
   * installed into the same node_modules folder into which "a" was installed (the Root's
   * node_modules folder), even though it is a dependency of "a" and not of the Root project.
   *
   * This nested dependency is not shown in an `npm ls` command run from the Root folder, even
   * though "b" is present in the Root node_modules folder../
   *
   * To solve this, we run `npm ls --all` which will show all installed packages, rather than only
   * those directly depended upon by the Root project.
   */

  let cwd = process.cwd()
  const root = getProjectRoot()
  const installingPackages: InstallingPackage[] = []

  do {
    if (!(await hasNodeModulesFolder(cwd))) {
      cwd = path.join(cwd, '..')
      continue
    }

    const dependencyTree = JSON.parse(exec('npm ls --all --json', { cwd }))

    // Matches come back as something like: [... parentPkgName, dependencies, instrumentedPackage]
    const matches = objectScan([`dependencies.**.${packageName}`], {
      filterFn: ({ value }: { value: InstallingPackage }) => value.version === packageVersion
    })(dependencyTree)

    if (matches.length >= 1) {
      installingPackages.push(
        ...matches.map((match: string[]) => {
          // We want to ignore last 2 to get the parent's info, not the child's
          const parentPkgPath = match.slice(0, -2)

          const parentPkg =
            parentPkgPath.length === 0
              ? dependencyTree
              : getPropertyByPath(dependencyTree, parentPkgPath)

          return {
            name:
              parentPkgPath.length === 0 ? dependencyTree.name : match[parentPkgPath.length - 1],
            version: parentPkg.version,
            dependencies: Object.entries(parentPkg.dependencies).map(([key, value]) => {
              return {
                name: key,
                version: (value as PackageData).version
              }
            })
          }
        })
      )
    }

    cwd = path.join(cwd, '..')
  } while (cwd !== root)

  return installingPackages
}
