/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it, vi } from 'vitest'

import { Environment } from '../main/core/environment.js'
import notify from '../notify.js'

describe('notify', () => {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn())

  it('should log to the console a telemetry notice', () => {
    notify(new Environment({ isCI: true, isTelemetryEnabled: true }))
    expect(spy).toHaveBeenCalledTimes(1)
    vi.resetAllMocks()
  })

  it('should not log to the console if telemetry is not enabled', () => {
    notify(new Environment({ isCI: true, isTelemetryEnabled: false }))
    expect(spy).not.toHaveBeenCalled()
    vi.resetAllMocks()
  })

  it('should not log to the console if the process is not in CI', () => {
    notify(new Environment({ isCI: false, isTelemetryEnabled: true }))
    expect(spy).not.toHaveBeenCalled()
    vi.resetAllMocks()
  })
})
