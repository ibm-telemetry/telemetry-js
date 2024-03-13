/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import lodashGet from 'lodash/get.js'

import { findNestedDeps } from './find-nested-deps.js'
import { DependencyTree, PackageData } from './interfaces.js'

/**
 * Finds all dependency sub-trees rooted at the desired package/version
 * given a bigger dependency tree.
 *
 * @param dependencyTree - The tree to search.
 * @param pkg - Package to find rooted trees for.
 * @returns A (possibly empty) array of dependency trees rooted at the pkg param.
 */
export function getPackageTrees(
  dependencyTree: DependencyTree,
  pkg: PackageData
): DependencyTree[] {
  if (dependencyTree.name === pkg.name && dependencyTree.version === pkg.version) {
    dependencyTree['path'] = []
    return [dependencyTree]
  }

  const prefixPackagePaths = findNestedDeps(
    dependencyTree,
    pkg.name,
    ({ value }) => value.version === pkg.version
  )

  if (prefixPackagePaths.length > 0) {
    return prefixPackagePaths.map((path) => ({
      path,
      ...lodashGet(dependencyTree, path)
    }))
  }

  return []
}
