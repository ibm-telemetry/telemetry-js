/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path'

import { InvalidRootPathError } from '../exceptions/invalid-root-path-error.js'
import { Loggable } from './log/loggable.js'
import { Trace } from './log/trace.js'

/**
 * Class capable of enumerating directories based on a leaf dir, root dir, and predicate function.
 */
export class DirectoryEnumerator extends Loggable {
  /**
   * Finds directories between leaf and root (inclusive) which satisfy the predicate. The
   * directories are returned ordered from most-nested to least-nested.
   *
   * @param leaf - Leaf-most directory. This must be inside of the root directory. This is an
   * absolute path.
   * @param root - Root-most directory. This is an absolute path.
   * @param predicate - Function to indicate whether or not each enumerated directory should be part
   * of the result set.
   * @returns A (possibly empty) array of directories.
   */
  @Trace()
  public async find(
    leaf: string,
    root: string,
    predicate: (dir: string) => boolean | Promise<boolean>
  ): Promise<string[]> {
    // (if leaf is not a subpath of root, throw an exception)
    if (path.relative(root, leaf).startsWith('..')) {
      throw new InvalidRootPathError(leaf, root)
    }

    const dirs = []

    for (let cur = leaf; cur !== root; cur = path.resolve(cur, '..')) {
      dirs.push(cur)
    }
    dirs.push(root)

    const checks = await Promise.all(dirs.map(predicate))

    return dirs.filter((_dir, index) => checks[index] === true)
  }
}
