/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when no installation could be found for a given (instrumented) package.
 */
export class NoInstallationFoundError extends Error {
  constructor(packageName: string) {
    super(`No package installation found for ${packageName}`)
  }
}
