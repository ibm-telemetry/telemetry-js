/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Error indicating that there was a problem validation a config file against a provided schema.
 */
export class ConfigValidationError extends Error {
  public readonly errors: Array<Record<string, unknown>>

  constructor(errors: Array<Record<string, unknown>>) {
    super(JSON.stringify(errors, undefined, 2))

    this.errors = errors
  }
}
