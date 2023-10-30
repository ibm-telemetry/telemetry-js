/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Attributes } from '@opentelemetry/api'
import { SemVer } from 'semver'

import { anonymize } from '../../../core/anonymize.js'
import { CustomResourceAttributes } from '../../../core/custom-resource-attributes.js'
import { type Logger } from '../../../core/log/logger.js'
import { Trace } from '../../../core/log/trace.js'
import { ScopeMetric } from '../../../core/scope-metric.js'

export interface DependencyData {
  name: string
  version: string
  installerRawName: string
  installerRawVersion: string
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
    } = this.getPackageDetails(this.data.installerRawName, this.data.installerRawVersion)

    return anonymize(
      {
        [CustomResourceAttributes.RAW]: this.data.name,
        [CustomResourceAttributes.OWNER]: owner,
        [CustomResourceAttributes.NAME]: name,
        [CustomResourceAttributes.VERSION_RAW]: this.data.version,
        [CustomResourceAttributes.VERSION_MAJOR]: major.toString(),
        [CustomResourceAttributes.VERSION_MINOR]: minor.toString(),
        [CustomResourceAttributes.VERSION_PATCH]: patch.toString(),
        [CustomResourceAttributes.VERSION_PRE_RELEASE]: preRelease?.join('.'),
        [CustomResourceAttributes.INSTALLER_RAW]: this.data.installerRawName,
        [CustomResourceAttributes.INSTALLER_OWNER]: installerOwner,
        [CustomResourceAttributes.INSTALLER_NAME]: installerName,
        [CustomResourceAttributes.INSTALLER_VERSION_RAW]: this.data.installerRawVersion,
        [CustomResourceAttributes.INSTALLER_VERSION_MAJOR]: installerMajor.toString(),
        [CustomResourceAttributes.INSTALLER_VERSION_MINOR]: installerMinor.toString(),
        [CustomResourceAttributes.INSTALLER_VERSION_PATCH]: installerPatch.toString(),
        [CustomResourceAttributes.INSTALLER_VERSION_PRE_RELEASE]: installerPreRelease?.join('.')
      },
      {
        hash: [
          CustomResourceAttributes.RAW,
          CustomResourceAttributes.OWNER,
          CustomResourceAttributes.NAME,
          CustomResourceAttributes.VERSION_RAW,
          CustomResourceAttributes.VERSION_PRE_RELEASE,
          CustomResourceAttributes.INSTALLER_RAW,
          CustomResourceAttributes.INSTALLER_OWNER,
          CustomResourceAttributes.INSTALLER_NAME,
          CustomResourceAttributes.INSTALLER_VERSION_RAW,
          CustomResourceAttributes.INSTALLER_VERSION_PRE_RELEASE
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
