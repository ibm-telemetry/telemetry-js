/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Attributes } from '@opentelemetry/api'

import { anonymize } from '../../../core/anonymize.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { getPackageDetails } from '../../utils/get-package-details.js'

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
   */
  public constructor(data: DependencyData) {
    super()
    this.name = 'dependency.count'
    this.data = data
  }

  /**
   * Get all OpenTelemetry Attributes for this metric data point.
   *
   * @returns OpenTelemetry compliant attributes, anonymized where necessary.
   */
  public override get attributes(): Attributes {
    const { owner, name, major, minor, patch, preRelease } = getPackageDetails(
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
    } = getPackageDetails(this.data.installerName, this.data.installerVersion)

    return anonymize(
      {
        raw: this.data.name,
        owner,
        name,
        'version.raw': this.data.version,
        'version.major': major?.toString(),
        'version.minor': minor?.toString(),
        'version.patch': patch?.toString(),
        'version.preRelease': preRelease?.join('.'),
        'installer.raw': this.data.installerName,
        'installer.owner': installerOwner,
        'installer.name': installerName,
        'installer.version.raw': this.data.installerVersion,
        'installer.version.major': installerMajor?.toString(),
        'installer.version.minor': installerMinor?.toString(),
        'installer.version.patch': installerPatch?.toString(),
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
}
