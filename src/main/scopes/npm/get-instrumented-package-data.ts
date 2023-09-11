/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getPackageData } from './get-package-data.js'

/**
 * Get details about the instrumented package by looking at the package.json file in the current
 * working directory.
 *
 * @returns An object with details about the instrumented package.
 */
export async function getInstrumentedPackageData() {
  return await getPackageData(process.cwd())
}
