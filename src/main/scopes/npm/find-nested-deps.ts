/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import objectScan from 'object-scan'

import { DependencyTree } from '../jsx/interfaces.js'
import { type InstallingPackage } from './interfaces.js'

/**
 * Given a dependency tree, package name, and package version, finds all object keys within the tree
 * which represent the package name/version combo as a dependency of another package.
 *
 * @param dependencyTree - The tree to search.
 * @param packageName - The name of the package for which to search.
 * @param filterFn - Function to filter results by.
 * @returns An array of results, returned by the object-scan library.
 */
export function findNestedDeps(
  dependencyTree: DependencyTree,
  packageName: string,
  filterFn: ({ value }: { value: InstallingPackage }) => boolean
) {
  return objectScan([`**.dependencies.${packageName}`], {
    filterFn
  })(dependencyTree)
}
