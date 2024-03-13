/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ciInfo = require('ci-info')

interface EnvironmentConfig {
  isCI?: boolean
  isExportEnabled?: boolean
  isTelemetryEnabled?: boolean
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
   * Exporting can be disabled (for testing purposes) by exporting IBM_TELEMETRY_EXPORT_DISABLED as
   * 'true'.
   */
  readonly isExportEnabled: boolean

  /**
   * Telemetry collection can be disabled by exporting IBM_TELEMETRY_DISABLED as 'true'.
   */
  readonly isTelemetryEnabled: boolean

  constructor(config?: EnvironmentConfig) {
    this.isCI = ciInfo.isCI
    this.isExportEnabled = process.env['IBM_TELEMETRY_EXPORT_DISABLED'] !== 'true'
    this.isTelemetryEnabled = process.env['IBM_TELEMETRY_DISABLED'] !== 'true'

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
  }
}
