/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type FileTree } from './interfaces.js'

/**
 * Given an ordered directory tree, finds the "most nested" directory that contains the file.
 *
 * @param fileName - File for which to find the deepest directory.
 * @param directoryTree - Tree structure of directories against which to match files.
 * @returns Directory path.
 */
export function findDeepestContainingDirectory(
  fileName: string,
  directoryTree: FileTree[]
): string | undefined {
  let next = directoryTree.find((tree) => fileName.includes(tree.path))
  let curr
  while (next !== undefined) {
    curr = next
    next = curr.children.find((tree) => fileName.includes(tree.path))
  }
  return curr?.path
}
