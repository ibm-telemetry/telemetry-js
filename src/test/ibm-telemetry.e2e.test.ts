/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as path from 'node:path'

import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json' assert { type: 'json' }
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import isInsideContainer from 'is-inside-container'
import mock from 'mock-fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Environment } from '../main/core/environment.js'
import { OpenTelemetryContext } from '../main/core/open-telemetry-context.js'
import { UnknownScopeError } from '../main/exceptions/unknown-scope-error.js'
import { IbmTelemetry } from '../main/ibm-telemetry.js'
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

    it('isCI can return the config through getter', async () => {
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
      const debugSpy = vi.spyOn(logger, 'debug')

      ibmTelemetry.run()
      expect(debugSpy).toHaveBeenCalledWith('Telemetry disabled via environment variable')
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
      const debugSpy = vi.spyOn(logger, 'debug')

      ibmTelemetry.run()
      expect(debugSpy).toHaveBeenCalledWith('Telemetry disabled because not running in CI')
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

  describe('getData', () => {
    it('returns correct projectRoot and documentObject', async () => {
      // Mock the Date object to UTC
      const mockDate = new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0))
      vi.setSystemTime(mockDate)

      const environment = new Environment({ cwd: '/some/path' })
      const gitInfo = {
        'analyzed.commit': '12345678',
        'analyzed.host': 'github.com',
        'analyzed.owner': 'me',
        'analyzed.path': 'github.com/me/somerepo',
        'analyzed.ownerPath': 'me/somerepo',
        'analyzed.refs': ['test']
      }

      const config = { projectId: 'test-project' } as ConfigSchema
      const ibmTelemetry = new IbmTelemetry(config, environment, gitInfo, logger)

      // Mock `getRepositoryRoot` and `getTelemetryPackageData`
      vi.mock('../main/core/get-repository-root.js', () => ({
        getRepositoryRoot: vi.fn(async () => '/some/repository/root')
      }))
      vi.mock('../main/scopes/npm/get-telemetry-package-data.js', () => ({
        getTelemetryPackageData: vi.fn(async () => ({
          name: 'telemetry-pkg',
          version: '1.0.0'
        }))
      }))

      const result = await ibmTelemetry.getData()

      // Validate the result
      expect(result.projectRoot).toBe('/some/repository/root')
      expect(result.emitterInfo).toEqual({ name: 'telemetry-pkg', version: '1.0.0' })

      // Validate the documentObject structure
      expect(result.documentObject).toMatchObject({
        'telemetry.emitter.name': 'telemetry-pkg',
        'telemetry.emitter.version': '1.0.0',
        'project.id': 'test-project',
        'analyzed.commit': '12345678',
        'analyzed.host': 'github.com',
        'analyzed.owner': 'me',
        'analyzed.path': 'github.com/me/somerepo',
        'analyzed.ownerPath': 'me/somerepo',
        'analyzed.refs': ['test'],
        date: '2025-01-01T00:00:00.000Z'
      })

      vi.restoreAllMocks()
      vi.useRealTimers()
    })
  })

  describe('run', () => {
    it('should run successfully with telemetry enabled and CI', async () => {
      const environment = new Environment({
        cwd: '/some/path',
        isTelemetryEnabled: true,
        isCI: true,
        isExportEnabled: true
      })

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

      const gitInfo = {
        'analyzed.commit': '12345678',
        'analyzed.host': 'github.com',
        'analyzed.owner': 'me',
        'analyzed.path': 'github.com/me/somerepo',
        'analyzed.ownerPath': 'me/somerepo',
        'analyzed.refs': ['test']
      }

      // Create instance of IbmTelemetry
      const ibmTelemetry = new IbmTelemetry(config, environment, gitInfo, logger)

      // Mock OpenTelemetryContext
      const otelContextMock = {
        setAttributes: vi.fn(), // Mock setAttributes
        getMetricReader: vi.fn(() => ({
          collect: vi.fn().mockResolvedValue({
            resourceMetrics: { scopeMetrics: 'value2' } // Mock resourceMetrics
          })
        }))
      }

      // Mock the getInstance method to return the mock OpenTelemetry context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- No need for a full mock
      vi.spyOn(OpenTelemetryContext, 'getInstance').mockReturnValue(otelContextMock as any)

      // Mock `getData`
      vi.spyOn(ibmTelemetry, 'getData').mockResolvedValue({
        projectRoot: '/some/repository/root',
        emitterInfo: { name: 'telemetry-pkg', version: '1.0.0' },
        documentObject: {
          'telemetry.emitter.name': 'telemetry-pkg',
          'telemetry.emitter.version': '1.0.0',
          'project.id': 'test-project',
          ...gitInfo,
          date: '2025-01-01T00:00:00.000Z'
        }
      })

      const runScopesSpy = vi.spyOn(ibmTelemetry, 'runScopes')
      const emitMetricsSpy = vi.spyOn(ibmTelemetry, 'emitMetrics')
      const collectSpy = vi.spyOn(OTLPMetricExporter.prototype, 'export')
      const debugSpy = vi.spyOn(logger, 'debug')

      await ibmTelemetry.run()

      // Verify logger.debug calls
      expect(debugSpy).toHaveBeenCalledWith('Environment: ' + JSON.stringify(environment))
      expect(debugSpy).toHaveBeenCalledWith('Schema: ' + JSON.stringify(configSchemaJson))
      expect(debugSpy).toHaveBeenCalledWith('Config: ' + JSON.stringify(config, undefined, 2))

      expect(runScopesSpy).toHaveBeenCalled()

      // Verify all data is being sent properly
      expect(otelContextMock.setAttributes).toHaveBeenCalledWith({
        'telemetry.emitter.name': 'telemetry-pkg',
        'telemetry.emitter.version': '1.0.0',
        'project.id': 'test-project',
        'analyzed.commit': '12345678',
        'analyzed.host': 'github.com',
        'analyzed.owner': 'me',
        'analyzed.path': 'github.com/me/somerepo',
        'analyzed.ownerPath': 'me/somerepo',
        'analyzed.refs': ['test'],
        date: '2025-01-01T00:00:00.000Z'
      })

      expect(collectSpy).toHaveBeenCalledOnce()

      expect(emitMetricsSpy).toHaveBeenCalled()
    })
  })
})
