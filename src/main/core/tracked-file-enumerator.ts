/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'

import { Loggable } from './log/loggable.js'
import { Trace } from './log/trace.js'
import { runCommand } from './run-command.js'

/**
 * Class capable of enumerating and filtering all tracked files based on `git` command information.
 */
export class TrackedFileEnumerator extends Loggable {
  /**
   * Finds all tracked files under the provided root directory, filtering them based on which ones
   * satisfy the provided predicate. This method can also be used to find a singular tracked file by
   * passing a path to a file as `root` instead of a directory. This will result in an array of
   * length one being returned.
   *
   * The returned paths are absolute.
   *
   * @param root - Directory to consider as the root. This is an absolute path.
   * @param predicate - Function to indicate whether or not each enumerated file should be part of
   * the result set.
   * @returns A (possibly empty) array of files.
   */
  @Trace()
  public async find(
    root: string,
    predicate: (file: string) => boolean | Promise<boolean>
  ): Promise<string[]> {
    const allFiles = (
      await runCommand(`git ls-tree --full-tree --name-only -r HEAD ${root}`, this.logger)
    ).stdout
      .split(/\r?\n/g)
      .filter((file) => file !== '')

    const checks = await Promise.all(allFiles.map(predicate))

    return allFiles
      .filter((_file, index) => checks[index] === true)
      .map((file) => path.relative(root, file))
      .map((file) => path.resolve(root, file))
  }
}
