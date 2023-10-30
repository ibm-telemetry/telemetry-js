/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SemVer } from 'semver'

import { type Logger } from '../../core/log/logger.js'

/**
 * Extracts atomic attributes from the given package name and version.
 *
 * @param logger - Instance to use for logging.
 * @param rawPackageName - Raw name of package.
 * @param rawPackageVersion - Raw version of package.
 * @returns Object containing package owner, name, major, minor, patch and preRelease versions.
 */
export function getPackageDetails(
  logger: Logger,
  rawPackageName: string,
  rawPackageVersion?: string
) {
  logger.traceEnter('get-package-details', 'getPackageDetails', [rawPackageName, rawPackageVersion])
  let owner, name

  if (rawPackageName.startsWith('@') && rawPackageName.includes('/')) {
    ;[owner, name] = rawPackageName.split('/')
  } else {
    name = rawPackageName
  }
  let result

  if (rawPackageVersion !== null && rawPackageVersion !== undefined) {
    const { major, minor, patch, prerelease } = new SemVer(rawPackageVersion)
    result = {
      owner: owner === '' ? undefined : owner,
      name: name === '' ? undefined : name,
      major,
      minor,
      patch,
      preRelease: prerelease
    }
  } else {
    result = {
      owner: owner === '' ? undefined : owner,
      name: name === '' ? undefined : name
    }
  }

  logger.traceExit('get-package-details', 'getPackageDetails', result)
  return result
}
