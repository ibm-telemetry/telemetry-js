/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when no package.json files were found between the specified root directory and
 * current directory.
 */
export class NoPackageJsonFoundError extends Error {
  constructor(cwd: string, root: string) {
    super(`No package.json files found between ${root} and ${cwd}`)
  }
}
