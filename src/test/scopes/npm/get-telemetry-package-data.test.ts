/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it, vi } from 'vitest'

import * as exec from '../../../main/core/run-command.js'
import * as getPackageData from '../../../main/scopes/npm/get-package-data.js'
import { getTelemetryPackageData } from '../../../main/scopes/npm/get-telemetry-package-data.js'
import { initLogger } from '../../__utils/init-logger.js'

const spy = vi.spyOn(getPackageData, 'getPackageData')

vi.spyOn(exec, 'runCommand').mockResolvedValue({
  exitCode: 0,
  stdout: JSON.stringify({
    name: 'test-1',
    version: '1.0.0'
  }),
  stderr: ''
})

describe('getTelemetryPackageData', () => {
  const logger = initLogger()

  it('correctly reads name and version', async () => {
    await expect(getTelemetryPackageData(logger)).resolves.toStrictEqual({
      name: 'test-1',
      version: '1.0.0'
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
