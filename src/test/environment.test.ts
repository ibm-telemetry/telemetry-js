/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createHash } from 'node:crypto'

import mock from 'mock-fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const hash = createHash('sha256')
hash.update('Docker')
const dockerHash = hash.digest('hex')

const hash2 = createHash('sha256')
hash2.update('Podman')
const podmanHash = hash2.digest('hex')

describe('Environment', () => {
  describe('Container tests', () => {
    beforeEach(() => {
      vi.doMock('ci-info', () => ({
        isCI: false,
        name: null
      }))
    })
    it('is considered CI when running in Docker container', async () => {
      const { Environment } = await import('../main/core/environment.js')

      mock({
        '/.dockerenv': ''
      })
      const environment = new Environment()

      expect(environment.isCI).toBeTruthy()
      expect(environment.name).toBe(dockerHash)
    })

    it('is considered CI when running in Docker group', async () => {
      const { Environment } = await import('../main/core/environment.js')

      mock({
        '/proc/self/cgroup': 'docker'
      })
      const environment = new Environment()

      expect(environment.isCI).toBeTruthy()
      expect(environment.name).toBe(dockerHash)
    })

    it('is considered CI when running in Podman container', async () => {
      const { Environment } = await import('../main/core/environment.js')

      mock({
        '/run/.containerenv': ''
      })
      const environment = new Environment()

      expect(environment.isCI).toBeTruthy()
      expect(environment.name).toBe(podmanHash)
    })

    afterEach(() => {
      mock.restore()
      vi.resetModules()
    })
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
    expect(environment.name).toBe(
      '532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25'
    )
  })

  it('should set isCI to false when no env variables or files exist', async () => {
    vi.doMock('ci-info', () => ({
      isCI: false,
      name: null
    }))

    const { Environment } = await import('../main/core/environment.js')
    const environment = new Environment()

    expect(environment.isCI).toBe(false)
    expect(environment.name).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )
  })

  it('is considered CI when SPS_RUN_URL present', async () => {
    vi.stubEnv('PIPELINE_RUN_URL', 'http://example.com')

    const { Environment } = await import('../main/core/environment.js')
    const environment = new Environment()

    expect(environment.isCI).toBeTruthy()
    expect(environment.name).toBe(
      '52248ed2edc6357d79e479707820c30cf5a11da591950cc061d9d711c97b734f'
    )
  })

  it('is considered CI when SPS_RUN_ID present', async () => {
    vi.stubEnv('PIPELINE_RUN_ID', 'runID')

    const { Environment } = await import('../main/core/environment.js')
    const environment = new Environment()

    expect(environment.isCI).toBeTruthy()
    expect(environment.name).toBe(
      '52248ed2edc6357d79e479707820c30cf5a11da591950cc061d9d711c97b734f'
    )
  })

  afterEach(() => {
    mock.restore()
    vi.unstubAllEnvs()
    vi.resetModules()
  })
})
