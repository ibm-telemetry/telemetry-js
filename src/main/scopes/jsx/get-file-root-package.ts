/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { UnknownFilePackageError } from '../../exceptions/unknown-file-package-error.js'
import { getPackageData } from '../npm/get-package-data.js'
import { type FileTree } from './interfaces.js'

/**
 * Finds the (git) package name a given file belongs to.
 *
 * @param fileName - File to find package for.
 * @param packageJsonTrees - Tree structure of package.json files contained in the repository.
 * Used to match file against.
 * @param logger - Logger instance.
 * @returns Name of package file belongs to.
 * @throws UnknownFilePackageError if package could not be determined.
 */
export async function getFileRootPackage(fileName: string, packageJsonTrees: FileTree[], logger: Logger): Promise<string> {
  let next = packageJsonTrees.find(tree => fileName.includes(tree.root))
  let curr
  while (next !== undefined && next !== null) {
    curr = next
    next = curr.children.find(tree => fileName.includes(tree.root))
  }
  if (curr === undefined || curr === null) {
    throw new UnknownFilePackageError()
  }
  return (await getPackageData(curr.root, logger)).name
}
