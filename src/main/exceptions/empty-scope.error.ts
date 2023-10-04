/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when a scope is defined without any collectors.
 */
export class EmptyScopeError extends Error {
  constructor(scopeName: string) {
    super(`No configuration defined for ${scopeName} scope`)
  }
}
