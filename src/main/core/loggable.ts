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
export abstract class Loggable {
  protected abstract logger: Logger
}
