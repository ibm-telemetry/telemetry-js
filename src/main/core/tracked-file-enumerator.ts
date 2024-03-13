/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { access } from 'node:fs/promises'
import * as path from 'node:path'

import { InvalidRootPathError } from '../exceptions/invalid-root-path-error.js'
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

    return await Promise.all(
      allFiles
        .filter((_file, index) => checks[index] === true)
        .map(async (file) => await this.findAbsolutePath(file, root))
    )
  }

  /**
   * Given two paths that may have partially overlapping directory hierarchies, find an absolute
   * path that uses as many pieces of the two paths as possible.
   *
   * @param trackedFile - A file obtained from a git ls-tree command. This is NOT an absolute path.
   * @param root - An absolute path representing a root directory in which the tracked file is
   * contained.
   * @throws InvalidRootPathError if no valid path could be constructed using parts from both the
   * trackedFile path and the root path.
   * @returns A promise of a path.
   */
  private async findAbsolutePath(trackedFile: string, root: string) {
    trackedFile = path.normalize(trackedFile)
    root = path.normalize(root)
    const trackedFileParts = trackedFile.split(path.sep)
    const suffixParts: string[] = []

    while (trackedFileParts.length > 0) {
      if (root.endsWith(trackedFileParts.join(path.sep))) {
        break
      }

      suffixParts.unshift(trackedFileParts.pop() ?? '')
    }

    const finalPath = path.join(root, ...suffixParts)

    try {
      await access(finalPath)
    } catch {
      throw new InvalidRootPathError(trackedFile, root)
    }

    return finalPath
  }
}
