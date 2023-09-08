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

interface InstallingPackage extends PackageData {
  dependencies: PackageData[]
}

/**
 *
 * @param packageName
 * @param packageVersion
 */
export async function getInstallingPackages(
  packageName: string,
  packageVersion: string
): Promise<InstallingPackage[]> {
  return await scan(process.cwd(), getProjectRoot(), (dependencyTree) => {
    // Matches come back as something like: [..., parentPkgName, dependencies, instrumentedPackage]
    const matches = findNestedDeps(dependencyTree, packageName, packageVersion)

    if (matches.length >= 1) {
      // We want to ignore last 2 pieces to get the parent's info, not the child's
      return matches.map((match) => getPackageSubTree(dependencyTree, match.slice(0, -2)))
    }

    return []
  })
}

async function scan(
  cwd: string,
  root: string,
  // TODO: executor: () => string, ????? maybe??
  callback: (dependencyTree: Record<string, unknown>) => InstallingPackage[]
) {
  let prev: string | undefined

  while (prev !== root) {
    // `npm ls` will fail in a directory without a node_modules folder
    if (!(await hasNodeModulesFolder(cwd))) {
      prev = cwd
      cwd = path.join(cwd, '..')
      continue
    }

    const dependencyTree = JSON.parse(exec('npm ls --all --json', { cwd }))

    const results = callback(dependencyTree)

    if (results.length > 0) {
      return results
    }

    prev = cwd
    cwd = path.join(cwd, '..')
  }

  return []
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

function findNestedDeps(
  dependencyTree: Record<string, unknown>,
  packageName: string,
  packageVersion: string
) {
  return objectScan([`dependencies.**.${packageName}`], {
    // could this instead be something like **.dependencies.${packageName}?
    filterFn: ({ value }: { value: InstallingPackage }) => value.version === packageVersion
  })(dependencyTree)
}

function getPackageSubTree(
  dependencyTree: Record<string, unknown>,
  objectPath: string[]
): InstallingPackage {
  const tree = {
    name: objectPath[objectPath.length - 1], // This might be undefined and that's ok
    ...getPropertyByPath(dependencyTree, objectPath, dependencyTree)
  }

  return {
    name: tree.name,
    version: tree.version,
    dependencies: Object.entries(tree.dependencies).map(([key, value]) => {
      return {
        name: key,
        version: (value as PackageData).version
      }
    })
  }
}
