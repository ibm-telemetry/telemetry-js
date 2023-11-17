/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from '../../core/log/logger.js'
import { type FileTree } from './interfaces.js'

/**
 * Given an ordered directory tree, finds the "most nested" directory path from the tree that
 * contains the file.
 *
 * @param file - File for which to find the deepest directory. This is an absolute path.
 * @param directoryTree - Tree structure of directories against which to match files.
 * @param logger - Logger instance.
 * @returns Directory path.
 */
export function findDeepestContainingDirectory(
  file: string,
  directoryTree: FileTree[],
  logger: Logger
): string | undefined {
  logger.traceEnter('', 'findDeepestContainingDirectory', [file, directoryTree])

  let next = directoryTree.find((tree) => file.includes(tree.path))
  let curr
  while (next !== undefined) {
    curr = next
    next = curr.children.find((tree) => file.includes(tree.path))
  }

  logger.traceExit('', 'findDeepestContainingDirectory', curr?.path)
  return curr?.path
}
