/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'

import { type Logger } from '../../../core/log/logger.js'
import { TrackedFileEnumerator } from '../../../core/tracked-file-enumerator.js'
import { type FileTree } from '../interfaces.js'

/**
 * Constructs an array of trees from all package.json files in the given repository,
 * where every nested object is a subpath of the root.
 *
 * @param root - Root-most directory to consider. This is an absolute path.
 * @param logger - Logger instance.
 * @returns Array of trees of package.json files.
 */
export async function getPackageJsonTree(root: string, logger: Logger): Promise<FileTree[]> {
  logger.traceEnter('', 'getPackageJsonTree', [root])

  const dirs = (
    await new TrackedFileEnumerator(logger).find(
      root,
      (fileName) => path.basename(fileName) === 'package.json'
    )
  )
    .map((f) => path.dirname(f))
    .sort((a, b) => a.split('/').length - b.split('/').length)

  const tree: FileTree[] = []

  dirs.forEach((dir) => {
    let currNode = tree
    let nextNode = tree.find((root) => dir.includes(root.path))
    while (nextNode !== null && nextNode !== undefined) {
      currNode = nextNode.children
      nextNode = currNode.find((node) => dir.includes(node.path))
    }
    currNode.push({ path: dir, children: [] })
  })

  logger.traceExit('', 'getPackageJsonTree', tree)
  return tree
}
