/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path'

import { InvalidRootPathError } from '../../exceptions/invalid-root-path-error.js'
import { hasNodeModulesFolder } from './has-node-modules-folder.js'

/**
 * Given a root directory and a current directory, finds all directories between the root and
 * current which contain a node_modules folder. This indicates that they can be scanned for
 * dependency information via an `npm ls` command.
 *
 * @param cwd - The current/starting directory.
 * @param root - The root-most directory to consider.
 * @throws If the cwd is not a sub-path of the root.
 * @returns A (possibly empty) array of directory path strings.
 */
export async function findScannableDirectories(cwd: string, root: string) {
  const dirs = []
  // Ensure the format is normalized
  root = path.resolve(root)
  cwd = path.resolve(cwd)

  // (if cwd is not a subpath of root, throw an exception)
  if (path.relative(root, cwd).startsWith('..')) {
    throw new InvalidRootPathError(cwd, root)
  }

  do {
    if (await hasNodeModulesFolder(cwd)) {
      dirs.push(cwd)
    }

    cwd = path.resolve(cwd, '..')
  } while (cwd !== root)

  if (await hasNodeModulesFolder(root)) {
    dirs.push(root)
  }

  return dirs
}
