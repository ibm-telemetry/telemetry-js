/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { type Logger } from '../../core/log/logger.js'
import { getPackageData } from './get-package-data.js'

/**
 * Get details about the currently running telemetry package by looking at the package.json file
 * closest to this file.
 *
 * @param logger - Logger instance.
 * @returns An object with details about the currently running telemetry package.
 */
export async function getTelemetryPackageData(logger: Logger) {
  // Remove leading file://
  const currentFileDir = path.dirname(import.meta.url.substring(7))

  await logger.debug(
    'getTelemetryPackageData: Current file directory discovered as: ' + currentFileDir
  )

  return await getPackageData(currentFileDir, logger)
}
