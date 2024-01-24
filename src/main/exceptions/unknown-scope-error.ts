/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Error indicating that a scope name was unable to be found in the scope registry.
 */
export class UnknownScopeError extends Error {
  constructor(scopeName: string) {
    super('Unknown scope: ' + scopeName)
  }
}
