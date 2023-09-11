/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { findNestedDeps } from './find-nested-deps.js'
import { getPackageSubTree } from './get-package-sub-tree.js'

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
 * TODO.
 *
 * @param dependencyTree
 * @param packageName
 * @param packageVersion
 */
export function findInstallers(
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
