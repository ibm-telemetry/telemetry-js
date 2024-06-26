/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as path from 'node:path'

import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { describe, expect, it, vi } from 'vitest'

import { Environment } from '../main/core/environment.js'
import { OpenTelemetryContext } from '../main/core/open-telemetry-context.js'
import { UnknownScopeError } from '../main/exceptions/unknown-scope-error.js'
import { IbmTelemetry } from '../main/ibm-telemetry.js'
import { Fixture } from './__utils/fixture.js'
import { initLogger } from './__utils/init-logger.js'

describe('ibmTelemetry', () => {
  const logger = initLogger()

  describe('runScopes', () => {
    it('does not throw when existing scopes are specified in the config', async () => {
      const environment = new Environment({ isExportEnabled: false })
      const ibmTelemetry = new IbmTelemetry('', configSchemaJson, environment, logger)
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )

      const promises = ibmTelemetry.runScopes(cwd.path, root.path, {
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

    it('throws when unknown scopes are encountered in the config', async () => {
      const environment = new Environment({ isExportEnabled: false })
      const ibmTelemetry = new IbmTelemetry('', configSchemaJson, environment, logger)

      expect(() =>
        ibmTelemetry.runScopes('', '', {
          projectId: 'asdf',
          version: 1,
          collect: { notARealScope: null }
        } as unknown as ConfigSchema)
      ).toThrow(UnknownScopeError)
    })

    it('does nothing when telemetry is disabled via envvar', async () => {
      const environment = new Environment({ isTelemetryEnabled: false })
      const ibmTelemetry = new IbmTelemetry('', configSchemaJson, environment, logger)

      const runScopesSpy = vi.spyOn(ibmTelemetry, 'runScopes')

      ibmTelemetry.run()

      expect(runScopesSpy).not.toHaveBeenCalled()
    })

    it('does nothing when running in non-CI environment', async () => {
      const environment = new Environment({ isCI: false })
      const ibmTelemetry = new IbmTelemetry('', configSchemaJson, environment, logger)

      const runScopesSpy = vi.spyOn(ibmTelemetry, 'runScopes')

      ibmTelemetry.run()

      expect(runScopesSpy).not.toHaveBeenCalled()
    })
  })

  describe('emitMetrics', async () => {
    it('correctly exports metrics when metrics have been found', async () => {
      const environment = new Environment({ isExportEnabled: true })
      const ibmTelemetry = new IbmTelemetry('', configSchemaJson, environment, logger)
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )

      const otelContext = OpenTelemetryContext.getInstance()

      const config: ConfigSchema = {
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
      }

      const promises = ibmTelemetry.runScopes(cwd.path, root.path, config)

      await Promise.allSettled(promises)

      const mock = vi.spyOn(OTLPMetricExporter.prototype, 'export')

      const results = await otelContext.getMetricReader().collect()

      await ibmTelemetry.emitMetrics(results.resourceMetrics, config)

      expect(mock).toHaveBeenCalledOnce()
    })

    it('does not call export when scope metrics are empty', async () => {
      const environment = new Environment({ isExportEnabled: true })
      const ibmTelemetry = new IbmTelemetry('', configSchemaJson, environment, logger)
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )

      const otelContext = OpenTelemetryContext.getInstance()

      const config: ConfigSchema = {
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
      }

      const promises = ibmTelemetry.runScopes(cwd.path, root.path, config)

      await Promise.allSettled(promises)

      const mock = vi.spyOn(OTLPMetricExporter.prototype, 'export')

      const results = await otelContext.getMetricReader().collect()

      // force all metrics to be empty
      results.resourceMetrics.scopeMetrics = []

      await ibmTelemetry.emitMetrics(results.resourceMetrics, config)

      expect(mock).not.toHaveBeenCalled()
    })
  })
})
