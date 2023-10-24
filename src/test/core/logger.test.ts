/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { access, readFile, unlink } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import { createLogFilePath } from '../../main/core/log/create-log-file-path.js'
import { Logger } from '../../main/core/log/logger.js'

describe('logger', () => {
  it('creates and logs message to file', async () => {
    const date = new Date().toISOString()
    const logFilePath = await createLogFilePath(date)
    const logger = new Logger(logFilePath)

    await expect(access(logFilePath)).rejects.toThrow('ENOENT')

    logger.debug('test log')
    await logger.close()

    await expect(access(logFilePath)).resolves.toBeUndefined()

    const content = await readFile(logFilePath, 'utf8')

    expect(content.length).toBeGreaterThan(0)
    expect(content.startsWith('debug')).toBeTruthy()
    expect(content.trim().endsWith('test log')).toBeTruthy()

    await unlink(logFilePath)
  })
  it('logs error message', async () => {
    const date = new Date().toISOString()
    const logFilePath = await createLogFilePath(date)
    const logger = new Logger(logFilePath)

    await expect(access(logFilePath)).rejects.toThrow('ENOENT')

    const errorLog = new Error('the error message')

    logger.error(errorLog)
    await logger.close()

    await expect(access(logFilePath)).resolves.toBeUndefined()

    const content = await readFile(logFilePath, 'utf8')

    expect(content.length).toBeGreaterThan(0)
    expect(content.startsWith('error')).toBeTruthy()

    await unlink(logFilePath)
  })
})
