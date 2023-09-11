/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import objectScan from 'object-scan'

import { type InstallingPackage } from './interfaces.js'

/**
 * TODO.
 *
 * @param dependencyTree
 * @param packageName
 * @param packageVersion
 */
export function findNestedDeps(
  dependencyTree: Record<string, unknown>,
  packageName: string,
  packageVersion: string
) {
  return objectScan([`**.dependencies.${packageName}`], {
    filterFn: ({ value }: { value: InstallingPackage }) => value.version === packageVersion
  })(dependencyTree)
}
