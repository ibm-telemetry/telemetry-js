/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import lodashGet from 'lodash/get.js'
import type { ObjectPath } from 'object-scan'

import type { DependencyTree } from './interfaces.js'
/**
 * Retrieves a tree rooted at the parent of a package given it's dependencyTree path.
 *
 * @param dependencyTree - The tree to search.
 * @param packagePath - Path to the package to get parent tree for in the dependencyTree.
 * @returns A dependency tree rooted at the package's parent
 * or undefined if the package is already the root.
 */
export function getTreePredecessor(
  dependencyTree: DependencyTree,
  packagePath: ObjectPath
): DependencyTree | undefined {
  // already at the root
  if (packagePath.length === 0) return undefined

  if (packagePath.length === 2) return { path: [], ...dependencyTree }

  return {
    path: packagePath.slice(0, -2),
    ...lodashGet(dependencyTree, packagePath.slice(0, -2))
  }
}
