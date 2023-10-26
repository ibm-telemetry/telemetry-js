/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from './logger.js'

/**
 *  Abstract class which enforces that all child classes define a logger instance.
 */
export class Loggable {
  // JS-private notation is used to make this field non-enumerable
  readonly #logger: Logger

  /**
   * Gets the logger instance associated with this Loggable.
   *
   * @returns The logger instance.
   */
  protected get logger() {
    return this.#logger
  }

  /**
   * Constructs a loggable class.
   *
   * @param logger - The logger to use during logging.
   */
  public constructor(logger: Logger) {
    this.#logger = logger
  }
}
