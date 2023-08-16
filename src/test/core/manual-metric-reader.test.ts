/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { ManualMetricReader } from '../../main/core/manual-metric-reader.js'

describe('manualMetricReader', () => {
  it('throws an exception when onShutdown is called', async () => {
    const metricReader = new ManualMetricReader()
    let error

    try {
      await metricReader.shutdown()
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('Method not implemented.')
  })

  it('throws an exception when onForceFlush is called', async () => {
    const metricReader = new ManualMetricReader()
    let error

    try {
      await metricReader.forceFlush()
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('Method not implemented.')
  })
})
