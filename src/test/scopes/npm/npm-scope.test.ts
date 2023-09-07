/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it, vi } from 'vitest'

import { type Logger } from '../../../main/core/log/logger.js'
import { DependencyMetric } from '../../../main/scopes/npm/metrics/dependency-metric.js'
import { NpmScope } from '../../../main/scopes/npm/npm-scope.js'

const mockedCapture = vi.fn()

vi.mock('../../../main/core/scope.js', () => {
  return {
    Scope: class MockedScopeClass {
      capture = mockedCapture
    }
  }
})

vi.spyOn(DependencyMetric.prototype, 'attributes', 'get').mockReturnValue({ name: 'test' })

const testLogger = {
  log: vi.fn()
}

describe('npmScope', () => {
  // eslint-disable-next-line vitest/no-disabled-tests --  TODO: rewrite test
  it.skip('correctly captures dependency data', async () => {
    const scope = new NpmScope(testLogger as unknown as Logger)
    await scope.run()
    expect(mockedCapture).toHaveBeenCalledTimes(2)
    expect(mockedCapture).toHaveBeenCalledWith(
      new DependencyMetric({ name: 'test', version: '0.0.2', installer: 'test-parent' })
    )
    expect(mockedCapture).toHaveBeenCalledWith(
      new DependencyMetric({ name: 'test-2', version: '0.0.1', installer: 'test-parent' })
    )
  })
})
