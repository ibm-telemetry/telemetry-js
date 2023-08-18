/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { existsSync, unlinkSync } from 'fs'
import { readFile } from 'fs/promises'
import { describe, expect, it } from 'vitest'

import { Logger } from '../../main/core/logger.js'

describe('logger', () => {
  it('creates and logs message to file', async () => {
    const fileName = './ibmtelemetrics-test-file-1.log'
    const logger = new Logger(fileName)

    expect(existsSync(fileName)).toBeFalsy()

    await logger.log('debug', 'test log')

    expect(existsSync(fileName)).toBeTruthy()

    const content = await readFile(fileName, 'utf8')

    expect(content.length).toBeGreaterThan(0)
    expect(content.startsWith('debug')).toBeTruthy()
    expect(content.trim().endsWith('test log')).toBeTruthy()

    unlinkSync(fileName)
  })
  it('logs error message', async () => {
    const fileName = './ibmtelemetrics-test-file-2.log'
    const logger = new Logger(fileName)

    expect(existsSync(fileName)).toBeFalsy()

    const errorLog = new Error('the error message')

    await logger.log('debug', errorLog)

    expect(existsSync(fileName)).toBeTruthy()

    const content = await readFile(fileName, 'utf8')

    expect(content.length).toBeGreaterThan(0)
    expect(content.startsWith('debug')).toBeTruthy()

    unlinkSync(fileName)
  })
})
