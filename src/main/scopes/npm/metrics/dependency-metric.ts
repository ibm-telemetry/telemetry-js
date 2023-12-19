/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Attributes } from '@opentelemetry/api'

import { hash } from '../../../core/anonymize/hash.js'
import { type Logger } from '../../../core/log/logger.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { NpmScopeAttributes } from '../npm-scope-attributes.js'

export interface DependencyData {
  rawName: string
  rawVersion: string
  installerRawName: string
  installerRawVersion: string
  isInstrumented: 'true' | 'false'
}

/**
 * NPM scope metric that generates an npm.dependency individual metric for a given dependency.
 */
export class DependencyMetric extends ScopeMetric {
  public override name = 'npm.dependency' as const

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
      [NpmScopeAttributes.RAW]: this.data.rawName,
      [NpmScopeAttributes.OWNER]: owner,
      [NpmScopeAttributes.NAME]: name,
      [NpmScopeAttributes.INSTRUMENTED]: this.data.isInstrumented,
      [NpmScopeAttributes.VERSION_RAW]: this.data.rawVersion,
      [NpmScopeAttributes.VERSION_MAJOR]: major?.toString(),
      [NpmScopeAttributes.VERSION_MINOR]: minor?.toString(),
      [NpmScopeAttributes.VERSION_PATCH]: patch?.toString(),
      [NpmScopeAttributes.VERSION_PRE_RELEASE]: preRelease?.join('.'),
      [NpmScopeAttributes.INSTALLER_RAW]: this.data.installerRawName,
      [NpmScopeAttributes.INSTALLER_OWNER]: installerOwner,
      [NpmScopeAttributes.INSTALLER_NAME]: installerName,
      [NpmScopeAttributes.INSTALLER_VERSION_RAW]: this.data.installerRawVersion,
      [NpmScopeAttributes.INSTALLER_VERSION_MAJOR]: installerMajor?.toString(),
      [NpmScopeAttributes.INSTALLER_VERSION_MINOR]: installerMinor?.toString(),
      [NpmScopeAttributes.INSTALLER_VERSION_PATCH]: installerPatch?.toString(),
      [NpmScopeAttributes.INSTALLER_VERSION_PRE_RELEASE]: installerPreRelease?.join('.')
    }

    return hash(metricData, [
      NpmScopeAttributes.RAW,
      NpmScopeAttributes.OWNER,
      NpmScopeAttributes.NAME,
      NpmScopeAttributes.VERSION_RAW,
      NpmScopeAttributes.VERSION_PRE_RELEASE,
      NpmScopeAttributes.INSTALLER_RAW,
      NpmScopeAttributes.INSTALLER_OWNER,
      NpmScopeAttributes.INSTALLER_NAME,
      NpmScopeAttributes.INSTALLER_VERSION_RAW,
      NpmScopeAttributes.INSTALLER_VERSION_PRE_RELEASE
    ])
  }
}
