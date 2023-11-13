/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import { JsxScope } from '../../../main/scopes/jsx/jsx-scope.js'
import { clearDataPointTimes } from '../../__utils/clear-data-point-times.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'
import { initializeOtelForTest } from '../../__utils/initialize-otel-for-test.js'

const config: ConfigSchema = {
  projectId: 'abc123',
  version: 1,
  collect: {
    jsx: {
      elements: {
        allowedAttributeNames: ['firstProp', 'secondProp'],
        allowedAttributeStringValues: ['hi', 'wow']
      }
    }
  }
}

describe('class: JsxScope', () => {
  const logger = initLogger()
  describe('run', () => {
    it('correctly captures jsx element metric data', async () => {
      const metricReader = initializeOtelForTest()
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )
      const jsxScope = new JsxScope(cwd.path, root.path, config, logger)

      await jsxScope.run()

      const results = await metricReader.collect()

      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })

    it.todo('throws EmptyScopeError if no collector has been defined', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const scope = new JsxScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        { collect: { npm: {} }, projectId: '123', version: 1 },
        logger
      )

      await expect(scope.run()).rejects.toThrow(EmptyScopeError)
    })

    it.todo('throws an error if no package.json files were found', async () => {})
  })

  describe.todo('parseFile')
  describe.todo('removeIrrelevantImports')
  describe.todo('resolveElementImports')
  describe.todo('resolveInvokers')
})
