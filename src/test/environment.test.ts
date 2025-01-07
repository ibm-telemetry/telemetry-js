/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import mock from 'mock-fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('ibmTelemetry', () => {
  describe('Environment', () => {
    it('is considered CI when running in Docker container', async () => {
      const { Environment } = await import('../main/core/environment.js')

      mock({
        '/.dockerenv': ''
      })
      const environment = new Environment()

      expect(environment.isCI).toBeTruthy()
      expect(environment.name).toBe('Docker')
    })

    it('is considered CI when running in Docker group', async () => {
      const { Environment } = await import('../main/core/environment.js')

      mock({
        '/proc/self/cgroup': 'docker'
      })
      const environment = new Environment()

      expect(environment.isCI).toBeTruthy()
      expect(environment.name).toBe('Docker')
    })

    it('is considered CI when running in Podman container', async () => {
      const { Environment } = await import('../main/core/environment.js')

      mock({
        '/run/.containerenv': ''
      })
      const environment = new Environment()

      expect(environment.isCI).toBeTruthy()
      expect(environment.name).toBe('Podman')
    })

    it('uses a different cwd than default one when specified in the config', async () => {
      const { Environment } = await import('../main/core/environment.js')
      const environment = new Environment({ cwd: '/' })

      expect(environment.cwd).toBe('/')
      expect(environment.cwd).not.toEqual(process.cwd())
    })

    it('should set isCI to true when ci-info reports it', async () => {
      vi.doMock('ci-info', () => ({
        isCI: true,
        name: 'Test'
      }))

      const { Environment } = await import('../main/core/environment.js')
      const environment = new Environment()

      expect(environment.isCI).toBe(true)
      expect(environment.name).toBe('Test')
    })

    it('should set isCI to false when no env variables or files exist', async () => {
      vi.doMock('ci-info', () => ({
        isCI: false,
        name: ''
      }))

      const { Environment } = await import('../main/core/environment.js')
      const environment = new Environment()

      expect(environment.isCI).toBe(false)
      expect(environment.name).toBe('')
    })

    it('is considered CI when SPS_RUN_URL present', async () => {
      vi.stubEnv('PIPELINE_RUN_URL', 'http://example.com')

      const { Environment } = await import('../main/core/environment.js')
      const environment = new Environment()

      expect(environment.customCICheck()).toBeTruthy()
      expect(environment.isCI).toBeTruthy()
      expect(environment.name).toBe('SPS')
    })

    it('is considered CI when SPS_RUN_ID present', async () => {
      vi.stubEnv('PIPELINE_RUN_ID', 'runID')

      const { Environment } = await import('../main/core/environment.js')
      const environment = new Environment()

      expect(environment.customCICheck()).toBeTruthy()
      expect(environment.isCI).toBeTruthy()
      expect(environment.name).toBe('SPS')
    })

    afterEach(() => {
      mock.restore()
      vi.unstubAllEnvs()
      vi.resetModules()
    })
  })
})
