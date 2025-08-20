/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { existsSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { createLogFilePath } from '../../../main/core/log/create-log-file-path.js'

describe('createLogFilePath', () => {
  it('creates a path for a temp file', async () => {
    // 2023-08-29T20:02:44.226Z
    const date = new Date().toISOString()
    const logFilePath = createLogFilePath(date)

    expect(existsSync(logFilePath)).toBeFalsy()

    // Roughly matching this format:
    // ....../path/to/stuff/ibmtelemetry-20230829T200356643Z-012345.log
    expect(/ibmtelemetry-[\dTZ]+-\d{6}\.log/.test(logFilePath)).toBeTruthy()
  })
})
