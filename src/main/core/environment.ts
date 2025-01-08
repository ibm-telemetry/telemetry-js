/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'

import { isCI, name } from 'ci-info'

interface EnvironmentConfig {
  cwd?: string
  isCI?: boolean
  isExportEnabled?: boolean
  isTelemetryEnabled?: boolean
  name?: string
}

const customEnvs = {
  'Secure Pipelines Services': ['PIPELINE_RUN_URL', 'PIPELINE_RUN_ID', 'PIPELINE_ID']
}

/**
 * Class containing environment configuration data.
 */
export class Environment {
  /**
   * Whether or not the process is running in a continuous integration environment.
   */
  readonly isCI: boolean

  /**
   * The hashed name of the possible continuous integration environment the process is running in.
   */
  name: string

  /**
   * Exporting can be disabled (for testing purposes) by exporting IBM_TELEMETRY_EXPORT_DISABLED as
   * 'true'.
   */
  readonly isExportEnabled: boolean

  /**
   * Telemetry collection can be disabled by exporting IBM_TELEMETRY_DISABLED as 'true'.
   */
  readonly isTelemetryEnabled: boolean

  /**
   * Working directory to run process on.
   */
  readonly cwd: string

  constructor(config?: EnvironmentConfig) {
    this.name = name ?? ''
    this.isCI = isCI || this.customCICheck() || this.containerCheck()
    this.isExportEnabled = process.env['IBM_TELEMETRY_EXPORT_DISABLED'] !== 'true'
    this.isTelemetryEnabled = process.env['IBM_TELEMETRY_DISABLED'] !== 'true'
    this.cwd = process.cwd()

    // Config object supersedes environment variable values

    if (config?.isCI !== undefined) {
      this.isCI = config.isCI
    }
    if (config?.isExportEnabled !== undefined) {
      this.isExportEnabled = config.isExportEnabled
    }
    if (config?.isTelemetryEnabled !== undefined) {
      this.isTelemetryEnabled = config.isTelemetryEnabled
    }
    if (config?.cwd !== undefined) {
      this.cwd = config.cwd
    }

    if (this.name != '') {
      const hash = createHash('sha256')
      hash.update(this.name)
      this.name = hash.digest('hex')
    }
  }

  /**
   * Function to check for additional CIs that aren't covered by the ci-info package.
   *
   * @returns Whether env variables are found.
   */
  public customCICheck(): boolean {
    for (const [key, val] of Object.entries(customEnvs)) {
      if (val.some((varName) => process.env[varName] !== undefined)) {
        this.name = key // Set the matched name
        return true
      }
    }
    return false
  }

  /**
   * Function to retrieve container name depending on file existence.
   *
   * TODO: Fork 'is-inside-container' to behave more like 'ci-info' by retrieving name,
   * and even checking for other containers.
   *
   * @returns Whether environment is within container.
   */
  public containerCheck(): boolean {
    if (existsSync('/run/.containerenv')) {
      this.name = 'Podman'
      return true
    }

    if (existsSync('/.dockerenv')) {
      this.name = 'Docker'
      return true
    }

    if (existsSync('/proc/self/cgroup')) {
      try {
        const cgroupContent = readFileSync('/proc/self/cgroup', 'utf8')
        if (cgroupContent.includes('docker')) {
          this.name = 'Docker'
          return true
        }
      } catch (error) {
        console.log('Error reading /proc/self/cgroup:', error)
      }
    }

    return false
  }
}
