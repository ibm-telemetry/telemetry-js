/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Attributes } from '@opentelemetry/api'
import { SemVer } from 'semver'

import { anonymize } from '../../../core/anonymize.js'
import { type Logger } from '../../../core/log/logger.js'
import { Trace } from '../../../core/log/trace.js'
import { ScopeMetric } from '../../../core/scope-metric.js'

export interface DependencyData {
  name: string
  version: string
  installerName: string
  installerVersion: string
}

/**
 * NPM scope metric that generates a dependency.count individual metric for a given dependency.
 */
export class DependencyMetric extends ScopeMetric {
  public override name: string
  private readonly data: DependencyData

  /**
   * Constructs a DependencyMetric.
   *
   * @param data - Object containing name and version to extract data to generate metric from.
   * @param logger - The logger instance to use.
   */
  public constructor(data: DependencyData, logger: Logger) {
    super(logger)
    this.name = 'dependency.count'
    this.data = data
  }

  public override get attributes(): Attributes {
    const { owner, name, major, minor, patch, preRelease } = this.getPackageDetails(
      this.data.name,
      this.data.version
    )
    const {
      owner: installerOwner,
      name: installerName,
      major: installerMajor,
      minor: installerMinor,
      patch: installerPatch,
      preRelease: installerPreRelease
    } = this.getPackageDetails(this.data.installerName, this.data.installerVersion)

    return anonymize(
      {
        raw: this.data.name,
        owner,
        name,
        'version.raw': this.data.version,
        'version.major': major.toString(),
        'version.minor': minor.toString(),
        'version.patch': patch.toString(),
        'version.preRelease': preRelease?.join('.'),
        'installer.raw': this.data.installerName,
        'installer.owner': installerOwner,
        'installer.name': installerName,
        'installer.version.raw': this.data.installerVersion,
        'installer.version.major': installerMajor.toString(),
        'installer.version.minor': installerMinor.toString(),
        'installer.version.patch': installerPatch.toString(),
        'installer.version.preRelease': installerPreRelease?.join('.')
      },
      {
        hash: [
          'raw',
          'owner',
          'name',
          'version.raw',
          'version.preRelease',
          'installer.raw',
          'installer.owner',
          'installer.name',
          'installer.version.raw',
          'installer.version.preRelease'
        ]
      }
    )
  }

  /**
   * Extracts atomic attributes from the given package name and version.
   *
   * @param rawPackageName - Raw name of package.
   * @param rawPackageVersion - Raw version of package.
   * @returns Object containing package owner, name, major, minor, patch and preRelease versions.
   */
  @Trace()
  private getPackageDetails(rawPackageName: string, rawPackageVersion: string) {
    let owner, name

    if (rawPackageName.startsWith('@') && rawPackageName.includes('/')) {
      ;[owner, name] = rawPackageName.split('/')
    } else {
      name = rawPackageName
    }

    const { major, minor, patch, prerelease } = new SemVer(rawPackageVersion)

    return {
      owner: owner === '' ? undefined : owner,
      name: name === '' ? undefined : name,
      major,
      minor,
      patch,
      preRelease: prerelease.length === 0 ? undefined : prerelease
    }
  }
}
