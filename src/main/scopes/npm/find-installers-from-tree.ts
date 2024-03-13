/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { findNestedDeps } from './find-nested-deps.js'
import { getPackageSubTree } from './get-package-sub-tree.js'
import type { DependencyTree } from './interfaces.js'
import { type InstallingPackage } from './interfaces.js'

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

/**
 * Given a dependency tree, package name, and package version, finds all packages which install the
 * specified package name/version combo. Returns an array of results; or an empty array if no
 * installers were found.
 *
 * @param dependencyTree - The tree to search.
 * @param packageName - The name of the package for which to search.
 * @param filterFn - Function to filter results by.
 * @param logger - A logger instance.
 * @returns An array of results.
 */
export function findInstallersFromTree(
  dependencyTree: DependencyTree,
  packageName: string,
  filterFn: ({ value }: { value: InstallingPackage }) => boolean,
  logger: Logger
) {
  logger.traceEnter('', 'findInstallersFromTree', [dependencyTree, packageName, filterFn])

  let results: InstallingPackage[] = []

  // Matches come back as something like: [..., parentPkgName, dependencies, instrumentedPackage]
  const matches = findNestedDeps(dependencyTree, packageName, filterFn)

  if (matches.length >= 1) {
    // We want to ignore last 2 pieces to get the parent's info, not the child's
    results = matches.map((match) => getPackageSubTree(dependencyTree, match.slice(0, -2)))
  }

  logger.traceExit('', 'findInstallersFromTree', results)
  return results
}
