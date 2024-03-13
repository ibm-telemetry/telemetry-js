/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import semver = require('semver')

const { SemVer } = semver

import { Loggable } from './log/loggable.js'
import { Trace } from './log/trace.js'

interface BasicPackageDetails {
  owner: string | undefined
  name: string
}

interface FullPackageDetails extends BasicPackageDetails {
  major: number
  minor: number
  patch: number
  preRelease: ReadonlyArray<string | number> | undefined
}

/**
 * Class capable of providing metadata about packages based on name/version.
 */
export class PackageDetailsProvider extends Loggable {
  /**
   * Extracts atomic attributes from the given package name.
   *
   * @param rawPackageName - Raw name of package.
   * @returns Object containing package owner and name.
   */
  getPackageDetails(rawPackageName: string): BasicPackageDetails

  /**
   * Extracts atomic attributes from the given package name and version.
   *
   * @param rawPackageName - Raw name of package.
   * @param rawPackageVersion - Raw version of package.
   * @returns Object containing package owner, name, major, minor, patch and preRelease versions.
   */
  getPackageDetails(rawPackageName: string, rawPackageVersion: string): FullPackageDetails

  @Trace()
  getPackageDetails(
    rawPackageName: string,
    rawPackageVersion?: string
  ): BasicPackageDetails | FullPackageDetails {
    const [, owner, name] = /^(@[^/]+)\/(.+)/.exec(rawPackageName) ?? []

    if (rawPackageVersion !== undefined) {
      const { major, minor, patch, prerelease } = new SemVer(rawPackageVersion)

      return {
        owner,
        name: name ?? rawPackageName,
        major,
        minor,
        patch,
        preRelease: prerelease.length === 0 ? undefined : prerelease
      }
    }

    return {
      owner,
      name: name ?? rawPackageName
    }
  }
}
