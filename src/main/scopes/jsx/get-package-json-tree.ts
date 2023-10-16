/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { findNamedFiles } from './find-named-files.js'
import { type FileTree } from './interfaces.js'

/**
 * Constructs an array of trees from all package.json files in the given repository,
 *  where every nested object is a subpath of the root.
 *
 * @param cwd - Current working directory to find tracked files for.
 * @param logger - Logger instance.
 * @returns Array of trees of package.json files.
 */
export async function getFileTrees(cwd: string, logger: Logger): Promise<FileTree[]> {
  const packageJsonFiles = await findNamedFiles(cwd, logger, 'package.json')

  // remove fileName to obtain directories, sort by level of nesting
  const directories = packageJsonFiles.map(path => { const chunks = path.split('/'); chunks.pop(); return chunks.join('/') })
    .sort((a, b) => a.split('/').length - b.split('/').length)

  const tree: FileTree[] = []

  directories.forEach(path => {
    let currNode = tree
    let nextNode = tree.find(root => path.includes(root.root))
    while (nextNode !== null && nextNode !== undefined) {
      currNode = nextNode.children
      nextNode = currNode.find(node => path.includes(node.root))
    }
    currNode.push({ root: path, children: [] })
  })

  return tree
}
