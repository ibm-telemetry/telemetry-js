/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when an attempt to obtain package details for a given file fails.
 */
export class UnknownFilePackageError extends Error {
  constructor() {
    super('Could not determine file package from given filename')
  }
}
