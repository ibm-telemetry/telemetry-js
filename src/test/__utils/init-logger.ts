/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { afterAll } from 'vitest'

import { createLogFilePath } from '../../main/core/log/create-log-file-path.js'
import { Logger } from '../../main/core/log/logger.js'

/**
 * Test hook to initialize and return a logger. Also sets up an `afterAll` hook to close the logger
 * upon test completion.
 *
 * @returns A logger instance.
 */
export function initLogger() {
  const logger = new Logger(createLogFilePath(new Date().toISOString()))

  afterAll(async () => {
    await logger.close()
  })

  return logger
}
