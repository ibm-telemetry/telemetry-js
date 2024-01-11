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
import { GlobalScopeAttributes } from '../../global-scope-attributes.js'
import { PackageData } from '../interfaces.js'
import { NpmScopeAttributes } from '../npm-scope-attributes.js'

export interface DependencyData {
  rawName: string
  rawVersion: string
  isInstrumented: 'true' | 'false'
}

/**
 * NPM scope metric that generates an npm.dependency individual metric for a given dependency.
 */
export class DependencyMetric extends ScopeMetric {
  public override name = 'npm.dependency' as const

  private readonly data: DependencyData
  private readonly instrumentedPackage: PackageData

  /**
   * Constructs a DependencyMetric.
   *
   * @param data - Object containing name and version to extract data to generate metric from.
   * @param instrumentedPackage - Data (name and version) pertaining to instrumented package.
   * @param logger - The logger instance to use.
   */
  public constructor(data: DependencyData, instrumentedPackage: PackageData, logger: Logger) {
    super(logger)
    this.data = data
    this.instrumentedPackage = instrumentedPackage
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
      owner: instrumentedOwner,
      name: instrumentedName,
      major: instrumentedMajor,
      minor: instrumentedMinor,
      patch: instrumentedPatch,
      preRelease: instrumentedPreRelease
    } = packageDetailsProvider.getPackageDetails(
      this.instrumentedPackage.name,
      this.instrumentedPackage.version
    )

    const metricData: Attributes = {
      [NpmScopeAttributes.RAW]: this.data.rawName,
      [NpmScopeAttributes.OWNER]: owner,
      [NpmScopeAttributes.NAME]: name,
      [NpmScopeAttributes.IS_INSTRUMENTED]: this.data.isInstrumented,
      [NpmScopeAttributes.VERSION_RAW]: this.data.rawVersion,
      [NpmScopeAttributes.VERSION_MAJOR]: major?.toString(),
      [NpmScopeAttributes.VERSION_MINOR]: minor?.toString(),
      [NpmScopeAttributes.VERSION_PATCH]: patch?.toString(),
      [NpmScopeAttributes.VERSION_PRE_RELEASE]: preRelease?.join('.'),
      [GlobalScopeAttributes.INSTRUMENTED_RAW]: this.instrumentedPackage.name,
      [GlobalScopeAttributes.INSTRUMENTED_OWNER]: instrumentedOwner,
      [GlobalScopeAttributes.INSTRUMENTED_NAME]: instrumentedName,
      [GlobalScopeAttributes.INSTRUMENTED_VERSION_RAW]: this.instrumentedPackage.version,
      [GlobalScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: instrumentedMajor?.toString(),
      [GlobalScopeAttributes.INSTRUMENTED_VERSION_MINOR]: instrumentedMinor?.toString(),
      [GlobalScopeAttributes.INSTRUMENTED_VERSION_PATCH]: instrumentedPatch?.toString(),
      [GlobalScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: instrumentedPreRelease?.join('.')
    }

    return hash(metricData, [
      NpmScopeAttributes.RAW,
      NpmScopeAttributes.OWNER,
      NpmScopeAttributes.NAME,
      NpmScopeAttributes.VERSION_RAW,
      NpmScopeAttributes.VERSION_PRE_RELEASE,
      GlobalScopeAttributes.INSTRUMENTED_RAW,
      GlobalScopeAttributes.INSTRUMENTED_OWNER,
      GlobalScopeAttributes.INSTRUMENTED_NAME,
      GlobalScopeAttributes.INSTRUMENTED_VERSION_RAW,
      GlobalScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE
    ])
  }
}
