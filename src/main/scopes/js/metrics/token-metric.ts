/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsScopeAttributes, NpmScopeAttributes } from '@ibm/telemetry-attributes-js' // TODO: should be fixed when telemetryAttributes updates
import { Attributes } from '@opentelemetry/api'

import { hash } from '../../../core/anonymize/hash.js'
import { Logger } from '../../../core/log/logger.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { PackageData } from '../../npm/interfaces.js'
import { JsImport, JsToken } from '../interfaces.js'

/**
 * JSX scope metric that generates a jsx.token individual metric for a given token.
 */
export class TokenMetric extends ScopeMetric {
  public override name = 'js.token' as const
  private readonly jsToken: JsToken
  private readonly matchingImport: JsImport
  private readonly instrumentedPackage: PackageData

  /**
   * Constructs a TokenMetric.
   *
   * @param jsToken - Object containing token data to generate metric from.
   * @param matchingImport - Import that matched the provided JsToken in the file.
   * @param instrumentedPackage - Data (name and version) pertaining to instrumented package.
   * @param logger - Logger instance.
   */
  public constructor(
    jsToken: JsToken,
    matchingImport: JsImport,
    instrumentedPackage: PackageData,
    logger: Logger
  ) {
    super(logger)
    this.jsToken = jsToken
    this.matchingImport = matchingImport
    this.instrumentedPackage = instrumentedPackage
  }

  /**
   * Get all OpenTelemetry Attributes for this metric data point.
   *
   * @returns OpenTelemetry compliant attributes, anonymized and substituted where necessary.
   */
  public override get attributes(): Attributes {
    const packageDetailsProvider = new PackageDetailsProvider(this.logger)

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

    let metricData: Attributes = {
      [JsScopeAttributes.TOKEN_NAME]: this.jsToken.name,
      [JsScopeAttributes.TOKEN_ACCESS_PATH]: this.jsToken.accessPath,
      [NpmScopeAttributes.INSTRUMENTED_RAW]: this.instrumentedPackage.name,
      [NpmScopeAttributes.INSTRUMENTED_OWNER]: instrumentedOwner,
      [NpmScopeAttributes.INSTRUMENTED_NAME]: instrumentedName,
      [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: this.instrumentedPackage.version,
      [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: instrumentedMajor?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: instrumentedMinor?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: instrumentedPatch?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: instrumentedPreRelease?.join('.')
    }

    // Handle renamed tokens
    if (this.matchingImport.rename !== undefined) {
      metricData[JsScopeAttributes.NAME] = this.jsToken.name.replace(
        this.matchingImport.rename,
        this.matchingImport.name
      )
    }

    metricData = hash(metricData, [
      NpmScopeAttributes.INSTRUMENTED_RAW,
      NpmScopeAttributes.INSTRUMENTED_OWNER,
      NpmScopeAttributes.INSTRUMENTED_NAME,
      NpmScopeAttributes.INSTRUMENTED_VERSION_RAW,
      NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE
    ])

    return metricData
  }
}
