/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it, vi } from 'vitest'

import { createLogFilePath } from '../../../main/core/log/create-log-file-path.js'
import { Logger } from '../../../main/core/log/logger.js'
import { NpmScope } from '../../../main/scopes/npm/npm-scope.js'
import { Fixture } from '../../__utils/fixture.js'

const mockedCapture = vi.fn()

vi.mock('../../../main/core/scope.js', () => {
  return {
    Scope: class MockedScopeClass {
      capture = mockedCapture
    }
  }
})

const logger = new Logger(await createLogFilePath(new Date().toISOString()))

describe('npmScope', () => {
  it('correctly captures dependency data', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const scope = new NpmScope(fixture.path, logger)
    await scope.run()
    // TODO: switch to snapshots and maybe add e2e to the file names since these are integration
    expect(mockedCapture).toHaveBeenCalledTimes(2)
    //   expect(mockedCapture).toHaveBeenCalledWith(
    //     new DependencyMetric({
    //       name: 'test-dep-11',
    //       version: '1.0.1',
    //       installerName: 'installer-1',
    //       installerVersion: '1.0.0'
    //     })
    //   )
    //   expect(mockedCapture).toHaveBeenCalledWith(
    //     new DependencyMetric({
    //       name: 'test-dep-22',
    //       version: '1.0.4',
    //       installerName: 'installer-2',
    //       installerVersion: '1.0.0'
    //     })
    //   )
  })
})
