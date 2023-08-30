/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { existsSync, unlinkSync } from 'fs'
import { readFile } from 'fs/promises'
import { describe, expect, it } from 'vitest'

import { createLogFilePath } from '../../main/core/log/create-log-file-path.js'
import { Logger } from '../../main/core/log/logger.js'

describe('logger', () => {
  it('creates and logs message to file', async () => {
    const date = new Date().toISOString()
    const logFilePath = await createLogFilePath(date)
    const logger = new Logger(logFilePath)

    expect(existsSync(logFilePath)).toBeFalsy()

    await logger.log('debug', 'test log')

    expect(existsSync(logFilePath)).toBeTruthy()

    const content = await readFile(logFilePath, 'utf8')

    expect(content.length).toBeGreaterThan(0)
    expect(content.startsWith('debug')).toBeTruthy()
    expect(content.trim().endsWith('test log')).toBeTruthy()

    unlinkSync(logFilePath)
  })
  it('logs error message', async () => {
    const date = new Date().toISOString()
    const logFilePath = await createLogFilePath(date)
    const logger = new Logger(logFilePath)

    expect(existsSync(logFilePath)).toBeFalsy()

    const errorLog = new Error('the error message')

    await logger.log('debug', errorLog)

    expect(existsSync(logFilePath)).toBeTruthy()

    const content = await readFile(logFilePath, 'utf8')

    expect(content.length).toBeGreaterThan(0)
    expect(content.startsWith('debug')).toBeTruthy()

    unlinkSync(logFilePath)
  })
})
