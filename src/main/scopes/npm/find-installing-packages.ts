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
  const root = getProjectRoot()
  const dirs = await findScannableDirectories(cwd, root)

  let installers: InstallingPackage[] = []

  for (const d of dirs) {
    const dependencyTree = JSON.parse(await exec('npm ls --all --json', { cwd: d }))

    installers = findInstallers(dependencyTree, packageName, packageVersion)

    if (installers.length > 0) {
      break
    }
  }

  return installers
}

function findInstallers(
  dependencyTree: Record<string, unknown>,
  packageName: string,
  packageVersion: string
) {
  // Matches come back as something like: [..., parentPkgName, dependencies, instrumentedPackage]
  const matches = findNestedDeps(dependencyTree, packageName, packageVersion)

  if (matches.length >= 1) {
    // We want to ignore last 2 pieces to get the parent's info, not the child's
    return matches.map((match) => getPackageSubTree(dependencyTree, match.slice(0, -2)))
  }

  return []
}

async function findScannableDirectories(cwd: string, root: string) {
  const dirs = []

  // Ensure the format is normalized
  root = path.join(root)
  cwd = path.join(cwd)

  // TODO: ensure we can actually resolve one path from the other

  do {
    if (await hasNodeModulesFolder(cwd)) {
      dirs.push(cwd)
    }

    cwd = path.join(cwd, '..')
  } while (cwd !== root)

  return dirs
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
  // Name is specified before the spread to allow the object path lookup to provide the default
  // value. This can be overridden if the object being spread has its own name within it.
  const tree = {
    name: objectPath[objectPath.length - 1],
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
