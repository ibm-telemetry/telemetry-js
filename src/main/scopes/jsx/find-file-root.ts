/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type FileTree } from './interfaces.js'

/**
 * Finds the closest root directory a given file belongs to.
 *
 * @param fileName - File to find root for.
 * @param directoryTree - Tree structure of directories to match files to.
 * Used to match file against.
 * @returns Root directory name.
 */
export function findFileRoot(fileName: string, directoryTree: FileTree[]): string | undefined {
  let next = directoryTree.find((tree) => fileName.includes(tree.root))
  let curr
  while (next !== undefined && next !== null) {
    curr = next
    next = curr.children.find((tree) => fileName.includes(tree.root))
  }
  return curr?.root
}
