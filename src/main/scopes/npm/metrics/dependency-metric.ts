/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Attributes } from '@opentelemetry/api'

import { hash } from '../../../core/anonymize/hash.js'
import { CustomResourceAttributes } from '../../../core/custom-resource-attributes.js'
import { type Logger } from '../../../core/log/logger.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'

export interface DependencyData {
  rawName: string
  rawVersion: string
  installerRawName: string
  installerRawVersion: string
}

/**
 * NPM scope metric that generates a dependency.count individual metric for a given dependency.
 */
export class DependencyMetric extends ScopeMetric {
  public override name = 'dependency.count' as const

  private readonly data: DependencyData

  /**
   * Constructs a DependencyMetric.
   *
   * @param data - Object containing name and version to extract data to generate metric from.
   * @param logger - The logger instance to use.
   */
  public constructor(data: DependencyData, logger: Logger) {
    super(logger)
    this.data = data
  }

  /**
   * Get all OpenTelemetry Attributes for this metric data point.
   *
   * @returns OpenTelemetry compliant attributes, anonymized where necessary.
   */
  public override get attributes(): Attributes {
    const packageDetailsProvider = new PackageDetailsProvider(this.logger)

    const { owner, name, major, minor, patch, preRelease } =
      packageDetailsProvider.getPackageDetails(this.data.rawName, this.data.rawVersion)

    const {
      owner: installerOwner,
      name: installerName,
      major: installerMajor,
      minor: installerMinor,
      patch: installerPatch,
      preRelease: installerPreRelease
    } = packageDetailsProvider.getPackageDetails(
      this.data.installerRawName,
      this.data.installerRawVersion
    )

    const metricData: Attributes = {
      [CustomResourceAttributes.RAW]: this.data.rawName,
      [CustomResourceAttributes.OWNER]: owner,
      [CustomResourceAttributes.NAME]: name,
      [CustomResourceAttributes.VERSION_RAW]: this.data.rawVersion,
      [CustomResourceAttributes.VERSION_MAJOR]: major?.toString(),
      [CustomResourceAttributes.VERSION_MINOR]: minor?.toString(),
      [CustomResourceAttributes.VERSION_PATCH]: patch?.toString(),
      [CustomResourceAttributes.VERSION_PRE_RELEASE]: preRelease?.join('.'),
      [CustomResourceAttributes.INSTALLER_RAW]: this.data.installerRawName,
      [CustomResourceAttributes.INSTALLER_OWNER]: installerOwner,
      [CustomResourceAttributes.INSTALLER_NAME]: installerName,
      [CustomResourceAttributes.INSTALLER_VERSION_RAW]: this.data.installerRawVersion,
      [CustomResourceAttributes.INSTALLER_VERSION_MAJOR]: installerMajor?.toString(),
      [CustomResourceAttributes.INSTALLER_VERSION_MINOR]: installerMinor?.toString(),
      [CustomResourceAttributes.INSTALLER_VERSION_PATCH]: installerPatch?.toString(),
      [CustomResourceAttributes.INSTALLER_VERSION_PRE_RELEASE]: installerPreRelease?.join('.')
    }

    return hash(metricData, [
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
    ])
  }
}
