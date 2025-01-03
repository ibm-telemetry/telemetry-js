/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as isInsideContainerModule from 'is-inside-container'
import mock from 'mock-fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Environment } from '../main/core/environment.js'

describe('Custom environment', () => {
  it('is considered CI when SPS_RUN_URL present', async () => {
    vi.stubEnv('PIPELINE_RUN_URL', 'http://example.com')

    const environment = new Environment()

    expect(isInsideContainerModule.default()).toBeFalsy()
    expect(environment.customCICheck()).toBeTruthy()
    expect(environment.isCI).toBeTruthy()
    vi.unstubAllEnvs()
  })

  it('is considered CI when SPS_RUN_ID present', async () => {
    vi.stubEnv('PIPELINE_RUN_ID', 'runID')

    const environment = new Environment()

    expect(isInsideContainerModule.default()).toBeFalsy()
    expect(environment.customCICheck()).toBeTruthy()
    expect(environment.isCI).toBeTruthy()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    mock.restore()
    vi.clearAllMocks()
  })
})
