/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as path from 'node:path'
import * as url from 'node:url'

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
  const currentFileDir = path.dirname(url.fileURLToPath(import.meta.url))

  logger.debug('getTelemetryPackageData: Current file directory discovered as: ' + currentFileDir)

  return await getPackageData(currentFileDir, currentFileDir, logger)
}
