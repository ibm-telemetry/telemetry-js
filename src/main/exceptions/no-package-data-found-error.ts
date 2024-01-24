/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when no package data could be obtained for a given directory.
 */
export class NoPackageDataFoundError extends Error {
  constructor(dir: string) {
    super(`No package data available for directory ${dir}`)
  }
}
