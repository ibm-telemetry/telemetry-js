/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json'
import path from 'path'
import { describe, expect, it, vi } from 'vitest'

import { Environment } from '../main/core/environment.js'
import { UnknownScopeError } from '../main/exceptions/unknown-scope-error.js'
import { TelemetryCollector } from '../main/telemetry-collector.js'
import { Fixture } from './__utils/fixture.js'
import { initLogger } from './__utils/init-logger.js'

describe('telemetryCollector', () => {
  const logger = initLogger()

  describe('runScopes', () => {
    it('does not throw when existing scopes are specified in the config', async () => {
      const environment = new Environment({ isExportEnabled: false })
      const telemetryCollector = new TelemetryCollector('', configSchemaJson, environment, logger)
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )

      const promises = telemetryCollector.runScopes(cwd.path, root.path, {
        projectId: 'asdf',
        version: 1,
        endpoint: '',
        collect: {
          npm: { dependencies: null },
          jsx: {
            elements: {
              allowedAttributeNames: ['firstProp', 'secondProp'],
              allowedAttributeStringValues: ['hi', 'wow']
            }
          }
        }
      })

      expect(promises).toHaveLength(2)

      await Promise.allSettled(promises)
    })
  })

  it('throws when unknown scopes are encountered in the config', async () => {
    const environment = new Environment({ isExportEnabled: false })
    const telemetryCollector = new TelemetryCollector('', configSchemaJson, environment, logger)

    expect(() =>
      telemetryCollector.runScopes('', '', {
        projectId: 'asdf',
        version: 1,
        collect: { notARealScope: null }
      } as unknown as ConfigSchema)
    ).toThrow(UnknownScopeError)
  })

  it('does nothing when telemetry is disabled', async () => {
    const environment = new Environment({ isTelemetryEnabled: false })
    const telemetryCollector = new TelemetryCollector('', configSchemaJson, environment, logger)

    const runScopesSpy = vi.spyOn(telemetryCollector, 'runScopes')

    telemetryCollector.run()

    expect(runScopesSpy).not.toHaveBeenCalled()
  })
})
