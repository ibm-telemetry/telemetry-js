/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { access } from 'node:fs/promises'

import lodash from 'lodash'
import objectScan from 'object-scan'
import path from 'path'

import { exec } from '../../core/exec.js'
import { type PackageData } from './get-package-data.js'
import { getProjectRoot } from './get-project-root.js'

interface InstallingPackage extends PackageData {
  dependencies: PackageData[]
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
   * though "b" is present in the Root node_modules folder.
   *
   * To solve this, we run `npm ls --all` which will show all installed packages, rather than only
   * those directly depended upon by the Root project.
   */

  let prevCwd = null
  let cwd = process.cwd()
  const root = getProjectRoot()

  while (prevCwd !== root) {
    try {
      await access(path.join(cwd + '/node_modules'))
    } catch (_e) {
      prevCwd = cwd
      cwd = path.join(cwd, '..')
      continue
    }
    const dependencies = JSON.parse(exec('npm ls --all --json', { cwd }))

    const matches = objectScan([`dependencies.**.${packageName}`], {
      filterFn: ({ value }: { value: InstallingPackage }) => value.version === packageVersion
    })(dependencies)

    if (matches?.length >= 1) {
      return matches.map((match: string[]) => {
        // we want to ignore last 2 because: [... parentPkgName, dependencies, pkgName]
        const parentPkgPath = match.slice(0, -2)
        const parentPkg =
          parentPkgPath.length === 0 ? dependencies : lodash.get(dependencies, parentPkgPath)
        return {
          name: parentPkgPath.length === 0 ? dependencies.name : match[parentPkgPath.length - 1],
          version: parentPkg.version,
          dependencies: Object.entries(parentPkg.dependencies).map(([key, value]) => {
            return {
              name: key,
              version: (value as InstallingPackage).version
            }
          })
        }
      })
    }

    prevCwd = cwd
    cwd = path.join(cwd, '..')
  }

  return []
}
