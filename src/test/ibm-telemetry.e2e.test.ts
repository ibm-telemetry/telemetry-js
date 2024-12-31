/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as path from 'node:path'

import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import isInsideContainer from 'is-inside-container'
import mock from 'mock-fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Environment } from '../main/core/environment.js'
import { getRepositoryRoot } from '../main/core/get-repository-root.js'
import { OpenTelemetryContext } from '../main/core/open-telemetry-context.js'
import { UnknownScopeError } from '../main/exceptions/unknown-scope-error.js'
import { IbmTelemetry } from '../main/ibm-telemetry.js'
import { getTelemetryPackageData } from '../main/scopes/npm/get-telemetry-package-data.js'
import { Fixture } from './__utils/fixture.js'
import { initLogger } from './__utils/init-logger.js'

describe('ibmTelemetry', async () => {
  const logger = initLogger()

  describe('Environment', () => {
    it('is considered CI when running in Docker container', async () => {
      mock({
        '/.dockerenv': ''
      })
      const environment = new Environment()

      expect(environment.isCI).toBeTruthy()
      expect(isInsideContainer()).toBeTruthy()
      mock.restore()
    })

    it('is considered CI when running in Podman container', async () => {
      mock({
        '/run/.containerenv': ''
      })
      const environment = new Environment()

      expect(environment.isCI).toBeTruthy()
      expect(isInsideContainer()).toBeTruthy()
      mock.restore()
    })

    it('uses a different cwd than default one when specified in the config', async () => {
      const environment = new Environment({ cwd: '/' })

      expect(environment.cwd).toBe('/')
      expect(environment.cwd).not.toEqual(process.cwd())
    })

    it('should set isCI to true when ci-info reports it', async () => {
      vi.mock('ci-info', () => ({
        isCI: true
      }))

      const environment = new Environment()
      expect(environment.isCI).toBe(true)
    })

    it('should set isCI to true when inside a container', async () => {
      vi.mock('ci-info', () => ({
        isCI: false
      }))
      vi.mock('is-inside-container', () => ({
        __esModule: true,
        default: vi.fn(() => true)
      }))

      const environment = new Environment()
      expect(environment.isCI).toBe(true)
    })

    it('is can return the config through getter', async () => {
      const config = {
        cwd: '',
        isCI: false,
        isExportEnabled: false,
        isTelemetryEnabled: false
      }
      const environment = new Environment(config)

      expect(environment.isCI).toBeFalsy()
      expect(environment.getConfig()).toEqual(config)
    })

    it('should return mocked repository root', async () => {
      vi.mock('../main/core/get-repository-root.js', () => ({
        getRepositoryRoot: vi.fn(async () => '/repo-root')
      }))

      const repoRoot = await getRepositoryRoot('/fake/path', logger)

      expect(repoRoot).toBe('/repo-root')
    })

    it('should return mocked telemetry package data', async () => {
      vi.mock('../main/scopes/npm/get-telemetry-package-data.js', () => ({
        getTelemetryPackageData: vi.fn(async () => ({
          name: 'telemetry-package',
          version: '1.0.0'
        }))
      }))
      const telemetryData = await getTelemetryPackageData(logger)

      expect(telemetryData).toEqual({
        name: 'telemetry-package',
        version: '1.0.0'
      })
    })

    afterEach(() => {
      mock.restore()
      vi.clearAllMocks()
    })
  })

  describe('runScopes', () => {
    it('does not throw when existing scopes are specified in the config', async () => {
      const config = {
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
      } as ConfigSchema
      const environment = new Environment({ isExportEnabled: false })
      const ibmTelemetry = new IbmTelemetry(config, environment, {}, logger)
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )

      const promises = ibmTelemetry.runScopes(cwd.path, root.path, config)

      expect(promises).toHaveLength(2)

      await Promise.allSettled(promises)
    })

    it('throws when unknown scopes are encountered in the config', async () => {
      const config = {
        projectId: 'asdf',
        version: 1,
        collect: { notARealScope: null }
      } as unknown as ConfigSchema
      const environment = new Environment({ isExportEnabled: false })
      const ibmTelemetry = new IbmTelemetry(config, environment, {}, logger)

      expect(() => ibmTelemetry.runScopes('', '', config as unknown as ConfigSchema)).toThrow(
        UnknownScopeError
      )
    })

    it('does nothing when telemetry is disabled via envvar', async () => {
      const config = {
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
      } as ConfigSchema
      const environment = new Environment({ isTelemetryEnabled: false })
      const ibmTelemetry = new IbmTelemetry(config, environment, {}, logger)

      const runScopesSpy = vi.spyOn(ibmTelemetry, 'runScopes')

      ibmTelemetry.run()

      expect(runScopesSpy).not.toHaveBeenCalled()
    })

    it('does nothing when running in non-CI environment', async () => {
      const config = {
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
      } as ConfigSchema
      const environment = new Environment({ isCI: false })
      const ibmTelemetry = new IbmTelemetry(config, environment, {}, logger)

      const runScopesSpy = vi.spyOn(ibmTelemetry, 'runScopes')

      ibmTelemetry.run()

      expect(runScopesSpy).not.toHaveBeenCalled()
    })
  })

  describe('emitMetrics', async () => {
    it('correctly exports metrics when metrics have been found', async () => {
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

      const environment = new Environment({ isExportEnabled: true })
      const ibmTelemetry = new IbmTelemetry(config, environment, {}, logger)
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )

      const otelContext = OpenTelemetryContext.getInstance()

      const promises = ibmTelemetry.runScopes(cwd.path, root.path, config)

      await Promise.allSettled(promises)

      const mock = vi.spyOn(OTLPMetricExporter.prototype, 'export')

      const results = await otelContext.getMetricReader().collect()

      await ibmTelemetry.emitMetrics(results.resourceMetrics, config)

      expect(mock).toHaveBeenCalledOnce()
    })

    it('does not call export when scope metrics are empty', async () => {
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
      const environment = new Environment({ isExportEnabled: true })
      const ibmTelemetry = new IbmTelemetry(config, environment, {}, logger)
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )

      const otelContext = OpenTelemetryContext.getInstance()

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
