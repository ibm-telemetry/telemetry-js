/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import getPropertyByPath from 'lodash/get.js'

import { InvalidObjectPathError } from '../../exceptions/invalid-object-path-error.js'
import { type InstallingPackage, type PackageData } from './interfaces.js'

/**
 * TODO.
 *
 * @param dependencyTree
 * @param objectPath
 */
export function getPackageSubTree(
  dependencyTree: Record<string, unknown>,
  objectPath: string[]
): InstallingPackage {
  const tree = objectPath.length === 0 ? dependencyTree : getPropertyByPath(dependencyTree, objectPath)

  if (tree === undefined) {
    throw new InvalidObjectPathError()
  }

  if (tree.name === undefined) {
    tree.name = objectPath[objectPath.length - 1]
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
