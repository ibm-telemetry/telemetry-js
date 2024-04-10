/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsScopeAttributes, NpmScopeAttributes } from '@ibm/telemetry-attributes-js'
import type { Attributes } from '@opentelemetry/api'

import { hash } from '../../../core/anonymize/hash.js'
import { substituteArray } from '../../../core/anonymize/substitute-array.js'
import { Substitution } from '../../../core/anonymize/substitution.js'
import type { Logger } from '../../../core/log/logger.js'
import { safeStringify } from '../../../core/log/safe-stringify.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import type { PackageData } from '../../npm/interfaces.js'
import { ComplexValue } from '../complex-value.js'
import type { JsImport, JsToken } from '../interfaces.js'

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

    let tokenName = safeStringify(this.jsToken.name)
    const tokenAccessPath = this.jsToken.accessPath

    // Handle renamed tokens
    if (this.matchingImport.rename !== undefined) {
      tokenName = tokenName.replace(this.matchingImport.rename, this.matchingImport.name)
      // replace import name in access path
      tokenAccessPath[0] = this.matchingImport.name
    }

    const subs = new Substitution()
    // redact complex values
    tokenAccessPath.forEach((segment) => {
      if (segment instanceof ComplexValue) {
        tokenName = tokenName.replace(safeStringify(segment.complexValue), subs.put(segment))
      }
    })

    // redact "all" import
    if (this.matchingImport.isAll) {
      tokenAccessPath[0] = subs.put(this.matchingImport.name)
      tokenName = tokenName.replace(this.matchingImport.name, subs.put(this.matchingImport.name))
    }

    let metricData: Attributes = {
      [JsScopeAttributes.TOKEN_NAME]: tokenName,
      [JsScopeAttributes.TOKEN_MODULE_SPECIFIER]: this.matchingImport.path,
      [JsScopeAttributes.TOKEN_ACCESS_PATH]: substituteArray(
        tokenAccessPath,
        tokenAccessPath.filter((p) => typeof p === 'string')
      ).join(' '),
      [NpmScopeAttributes.INSTRUMENTED_RAW]: this.instrumentedPackage.name,
      [NpmScopeAttributes.INSTRUMENTED_OWNER]: instrumentedOwner,
      [NpmScopeAttributes.INSTRUMENTED_NAME]: instrumentedName,
      [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: this.instrumentedPackage.version,
      [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: instrumentedMajor?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: instrumentedMinor?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: instrumentedPatch?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: instrumentedPreRelease?.join('.')
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
