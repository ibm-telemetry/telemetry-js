/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when no node_modules folders were found between the specified root directory and
 * current directory.
 */
export class NoNodeModulesFoundError extends Error {
  constructor(cwd: string, root: string) {
    super(`No node_modules folders found between ${root} and ${cwd}`)
  }
}
