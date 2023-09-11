/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path'

import { InvalidRootPathError } from '../../exceptions/invalid-root-path-error.js'
import { hasNodeModulesFolder } from './has-node-modules-folder.js'

/**
 * TODO.
 *
 * @param cwd
 * @param root
 */
export async function findScannableDirectories(cwd: string, root: string) {
  const dirs = []
  // Ensure the format is normalized
  root = path.join(root)
  cwd = path.join(cwd)

  // (if cwd is not a subpath of root, throw an exception)
  if (path.relative(root, cwd).startsWith('..')) {
    throw new InvalidRootPathError(cwd, root)
  }

  do {
    if (await hasNodeModulesFolder(cwd)) {
      dirs.push(cwd)
    }

    cwd = path.join(cwd, '..')
  } while (cwd !== root)

  if (await hasNodeModulesFolder(root)) {
    dirs.push(root)
  }

  return dirs
}
