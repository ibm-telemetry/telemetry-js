/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when an invalid root is supplied for a given directory.
 */
export class InvalidRootPathError extends Error {
  constructor(root: string, cwd: string) {
    super(`${cwd} is not a subpath of ${root}`)
  }
}
