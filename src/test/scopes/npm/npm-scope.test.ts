/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it, vi } from 'vitest'

import { type Logger } from '../../../main/core/logger.js'
import { type ScopeMetric } from '../../../main/core/scope-metric.js'
import * as packageDependencies from '../../../main/scopes/npm/get-package-dependencies.js'
import { DependencyMetric } from '../../../main/scopes/npm/metrics/dependency-metric.js'
import { NpmScope } from '../../../main/scopes/npm/npm-scope.js'

const testLogger = {
  log: vi.fn()
}

const mockedCapture = vi.fn()

vi.mock('../../../main/core/scope.js', () => {
  return {
    Scope: class MockedScopeClass {
      capture = (metric: ScopeMetric) => {
        mockedCapture(metric)
      }
    }
  }
})

vi.spyOn(DependencyMetric.prototype, 'attributes', 'get').mockReturnValue({ name: 'test' })
vi.spyOn(packageDependencies, 'getPackageDependencies').mockImplementation((type) => {
  switch (type) {
    case 'base':
      return [{ name: 'test', version: '0.0.2' }]
    case 'dev':
      return [{ name: 'test-dev', version: '0.0.1' }]
    default:
      return []
  }
})

describe('npmScope', () => {
  it('correctly captures dependency data', async () => {
    const scope = new NpmScope(testLogger as unknown as Logger)
    await scope.run()
    expect(mockedCapture).toHaveBeenCalledTimes(2)
    expect(mockedCapture).toHaveBeenCalledWith(
      new DependencyMetric({ name: 'test', version: '0.0.2' })
    )
    expect(mockedCapture).toHaveBeenCalledWith(
      new DependencyMetric({ name: 'test-dev', version: '0.0.1' })
    )
  })
})
