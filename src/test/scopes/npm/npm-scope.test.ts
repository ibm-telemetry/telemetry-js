/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it, vi } from 'vitest'

import { type Logger } from '../../../main/core/log/logger.js'
import * as findInstallingPackages from '../../../main/scopes/npm/find-installing-packages.js'
import * as getInstrumentedPackageData from '../../../main/scopes/npm/get-instrumented-package-data.js'
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

const findInstallingPackagesSpy = vi
  .spyOn(findInstallingPackages, 'findInstallingPackages')
  .mockResolvedValue([
    {
      name: 'installer-1',
      version: '1.0.0',
      dependencies: [
        {
          name: 'test-dep-11',
          version: '1.0.1'
        },
        {
          name: 'test-dep-12',
          version: '1.0.2'
        }
      ]
    },
    {
      name: 'installer-2',
      version: '1.0.0',
      dependencies: [
        {
          name: 'test-dep-21',
          version: '1.0.3'
        },
        {
          name: 'test-dep-22',
          version: '1.0.4'
        }
      ]
    }
  ])

const getInstrumentedPackageDataSpy = vi
  .spyOn(getInstrumentedPackageData, 'getInstrumentedPackageData')
  .mockResolvedValue({ name: 'test', version: '1.0.0' })

const testLogger = {
  log: vi.fn()
}

describe('npmScope', () => {
  it('correctly captures dependency data', async () => {
    const scope = new NpmScope(testLogger as unknown as Logger)
    await scope.run()
    expect(getInstrumentedPackageDataSpy).toHaveBeenCalledTimes(1)
    expect(findInstallingPackagesSpy).toHaveBeenCalledWith('test', '1.0.0')
    expect(mockedCapture).toHaveBeenCalledTimes(4)
    expect(mockedCapture).toHaveBeenCalledWith(
      new DependencyMetric({
        name: 'test-dep-11',
        version: '1.0.1',
        installerName: 'installer-1',
        installerVersion: '1.0.0'
      })
    )
    expect(mockedCapture).toHaveBeenCalledWith(
      new DependencyMetric({
        name: 'test-dep-22',
        version: '1.0.4',
        installerName: 'installer-2',
        installerVersion: '1.0.0'
      })
    )
  })
})
