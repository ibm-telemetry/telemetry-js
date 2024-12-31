/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { isCI } from 'ci-info'
import isInsideContainer from 'is-inside-container'

interface EnvironmentConfig {
  cwd?: string
  isCI?: boolean
  isExportEnabled?: boolean
  isTelemetryEnabled?: boolean
}

const customEnvs = ['PIPELINE_RUN_URL', 'PIPELINE_RUN_ID', 'PIPELINE_ID']

/**
 * Class containing environment configuration data.
 */
export class Environment {
  /**
   * Whether or not the process is running in a continuous integration environment.
   */
  readonly isCI: boolean

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
    this.isCI = isCI || isInsideContainer() || this.customCICheck()
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
  }

  /**
   * Function to check for additional CIs that aren't covered by the ci-info package.
   *
   * @returns Whether env variables are found.
   */
  public customCICheck(): boolean {
    return customEnvs.some((envVar) => process.env[envVar] !== undefined)
  }
}
