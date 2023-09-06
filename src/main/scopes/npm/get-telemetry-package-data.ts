/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { getPackageData } from './get-package-data.js'

/**
 * Get details about the currently running telemetry package by looking at the package.json file
 * closest to this file.
 *
 * @returns An object with details about the currently running telemetry package.
 */
export function getTelemetryPackageData() {
  // Remove leading file://
  const cwd = path.dirname(import.meta.url.substring(7))

  return getPackageData(cwd)
}
