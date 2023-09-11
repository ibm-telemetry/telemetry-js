/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Error indicating that it was not possible to find a root.
 */
export class NoProjectRootError extends Error {
  /**
   * Default constructor for this Error.
   */
  public constructor() {
    super("Unable to find project's root directory")
  }
}