/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when a method was set up with tracing decorators, but did not define a Logger
 * instance to carry out logging.
 */
export class LoggerNotFoundError extends Error {
  /**
   * Default constructor for this error.
   */
  public constructor() {
    super('Attempt to trace method without a defined Logger instance')
  }
}
