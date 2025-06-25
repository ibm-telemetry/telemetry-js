/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { findNestedDeps } from './find-nested-deps.js'
import type { DependencyTree } from './interfaces.js'

/**
 * Finds all installed versions of a given package within a dependency tree
 * and returns the direct-most paths.
 *
 * @param dependencyTree - The tree to search.
 * @param pkgName - The tree to search.
 * @returns A (possibly empty) array of paths.
 */
export function getInstalledVersionPaths(dependencyTree: DependencyTree, pkgName: string) {
  // find all versions, sort by shortest paths
  const instrumentedInstallPaths = findNestedDeps(dependencyTree, pkgName, () => true).sort(
    (a, b) => a.length - b.length
  )

  if (instrumentedInstallPaths.length > 0) {
    // return all paths with shortest length
    return instrumentedInstallPaths.filter(
      (path) => path.length === instrumentedInstallPaths[0]?.length
    )
  }
  return []
}
