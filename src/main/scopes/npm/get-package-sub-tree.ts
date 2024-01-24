/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import getPropertyByPath from 'lodash/get.js'

import { InvalidObjectPathError } from '../../exceptions/invalid-object-path-error.js'
import { DependencyTree } from '../jsx/interfaces.js'
import { type InstallingPackage, type PackageData } from './interfaces.js'

/**
 * Given a dependency tree and an object path within that tree, return an object containing name,
 * version, and dependency information for the package found at the object path.
 *
 * @param dependencyTree - The tree from which to pull information.
 * @param objectPath - The path to an object within the dependency tree.
 * @throws If the object path did not exist in the dependency tree.
 * @returns An object containing package information.
 */
export function getPackageSubTree(
  dependencyTree: DependencyTree,
  objectPath: string[]
): InstallingPackage {
  const tree =
    objectPath.length === 0 ? dependencyTree : getPropertyByPath(dependencyTree, objectPath)

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
