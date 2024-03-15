/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as path from 'node:path'

import { describe, expect, it } from 'vitest'

import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import { NpmScope } from '../../../main/scopes/npm/npm-scope.js'
import { clearDataPointTimes } from '../../__utils/clear-data-point-times.js'
import { clearTelemetrySdkVersion } from '../../__utils/clear-telemetry-sdk-version.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'
import { initializeOtelForTest } from '../../__utils/initialize-otel-for-test.js'

describe('class: NpmScope', () => {
  const logger = initLogger()

  describe('run', () => {
    it('correctly captures dependency data', async () => {
      const cwd = new Fixture('projects/basic-project/node_modules/instrumented')
      const root = new Fixture('projects/basic-project')

      const scope = new NpmScope(
        cwd.path,
        root.path,
        { collect: { npm: { dependencies: null } }, projectId: '123', version: 1, endpoint: '' },
        logger
      )

      const metricReader = initializeOtelForTest().getMetricReader()

      await scope.run()

      const results = await metricReader.collect()

      clearTelemetrySdkVersion(results)
      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })

    it('throws EmptyScopeError if no collector has been defined', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const scope = new NpmScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        { collect: { npm: {} }, projectId: '123', version: 1, endpoint: '' },
        logger
      )

      await expect(scope.run()).rejects.toThrow(EmptyScopeError)
    })
  })
})
