/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fs from 'fs/promises'
import path from 'path'

import { DirectoryEnumerator } from '../../core/directory-enumerator.js'
import { type Logger } from '../../core/log/logger.js'
import { type FileTree } from './interfaces.js'

async function hasPackageJsonFile(dir: string) {
  const packageJsonPath = path.join(dir, 'package.json')

  try {
    await fs.access(packageJsonPath)
  } catch {
    return false
  }

  return true
}

/**
 * Constructs an array of trees from all package.json files in the given repository,
 *  where every nested object is a subpath of the root.
 *
 * @param root - Root-most directory to consider.
 * @param cwd - Current working directory to find tracked files for.
 * @param logger - Logger instance.
 * @returns Array of trees of package.json files.
 */
export async function getPackageJsonTree(
  root: string,
  cwd: string,
  logger: Logger
): Promise<FileTree[]> {
  const dirs = (await new DirectoryEnumerator(logger).find(cwd, root, hasPackageJsonFile)).sort(
    (a, b) => a.split('/').length - b.split('/').length
  )

  const tree: FileTree[] = []

  dirs.forEach((path) => {
    let currNode = tree
    let nextNode = tree.find((root) => path.includes(root.path))
    while (nextNode !== null && nextNode !== undefined) {
      currNode = nextNode.children
      nextNode = currNode.find((node) => path.includes(node.path))
    }
    currNode.push({ path, children: [] })
  })

  return tree
}
