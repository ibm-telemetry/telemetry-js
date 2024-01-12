/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import objectScan from 'object-scan'

import { type InstallingPackage, PackageData } from './interfaces.js'

/**
 * Given a dependency tree, package name, and package version, finds all object keys within the tree
 * which represent the package name/version combo as a dependency of another package.
 *
 * @param dependencyTree - The tree to search.
 * @param packageData - The name and specific version of the package for which to search.
 * @returns An array of results, returned by the object-scan library.
 */
export function findNestedDeps(dependencyTree: Record<string, unknown>, packageData: PackageData) {
  return objectScan([`**.dependencies.${packageData.name}`], {
    filterFn: ({ value }: { value: InstallingPackage }) => value.version === packageData.version
  })(dependencyTree)
}
