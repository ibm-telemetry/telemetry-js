/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SemVer } from 'semver'

/**
 * Extracts atomic attributes from the given package name and version.
 *
 * @param rawPackageName - Raw name of package.
 * @param rawPackageVersion - Raw version of package.
 * @returns Object containing package owner, name, major, minor, patch and preRelease versions.
 */
export function getPackageDetails(rawPackageName: string, rawPackageVersion?: string) {
  let owner, name

  if (rawPackageName.startsWith('@') && rawPackageName.includes('/')) {
    ;[owner, name] = rawPackageName.split('/')
  } else {
    name = rawPackageName
  }

  if (rawPackageVersion !== null && rawPackageVersion !== undefined) {
    const { major, minor, patch, prerelease } = new SemVer(rawPackageVersion)
    return { owner, name, major, minor, patch, preRelease: prerelease }
  }

  return {
    owner,
    name
  }
}
