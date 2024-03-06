/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsScopeAttributes, NpmScopeAttributes } from '@ibm/telemetry-attributes-js' // TODO: should be fixed when telemetryAttributes  updates
import { ConfigSchema } from '@ibm/telemetry-config-schema'
import { Attributes } from '@opentelemetry/api'

import { hash } from '../../../core/anonymize/hash.js'
import { substitute } from '../../../core/anonymize/substitute.js'
import { Logger } from '../../../core/log/logger.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { PackageData } from '../../npm/interfaces.js'
import { JsFunction, JsImport } from '../interfaces.js'

/**
 * JSX scope metric that generates a jsx.function individual metric for a given function.
 */
export class FunctionMetric extends ScopeMetric {
  public override name = 'js.function' as const
  private readonly jsFunction: JsFunction
  private readonly matchingImport: JsImport
  private readonly allowedArgumentStringValues: string[]
  private readonly instrumentedPackage: PackageData

  /**
   * Constructs a TokenMetric.
   *
   * @param jsToken - Object containing token data to generate metric from.
   * @param matchingImport - Import that matched the provided JsFunction in the file.
   * @param instrumentedPackage - Data (name and version) pertaining to instrumented package.
   * @param config - Determines which argument values to collect for.
   * @param logger - Logger instance.
   */
  public constructor(
    jsToken: JsFunction,
    matchingImport: JsImport,
    instrumentedPackage: PackageData,
    config: ConfigSchema,
    logger: Logger
  ) {
    super(logger)
    this.jsFunction = jsToken
    this.matchingImport = matchingImport
    this.instrumentedPackage = instrumentedPackage

    this.allowedArgumentStringValues =
      config.collect.js?.functions?.allowedArgumentStringValues ?? [] // TODO: should be fixed when configSchema updates
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

    // convert arguments into a fake object to satisfy the substitute api
    const argsObj: Record<string, unknown> = this.jsFunction.arguments.reduce(
      (cur, val, index) => ({ ...cur, [index.toString()]: val }),
      {}
    )

    const anonymizedArguments = substitute(
      argsObj,
      Object.keys(argsObj), // all keys are allowed
      this.allowedArgumentStringValues
    )

    let metricData: Attributes = {
      [JsScopeAttributes.FUNCTION.NAME]: this.jsFunction.name,
      [JsScopeAttributes.FUNCTION.ACCESS_PATH]: this.jsFunction.accessPath,
      [JsScopeAttributes.FUNCTION.ARGUMENT_VALUES]: Object.values(anonymizedArguments).map((arg) =>
        String(arg)
      ),
      [NpmScopeAttributes.INSTRUMENTED_RAW]: this.instrumentedPackage.name,
      [NpmScopeAttributes.INSTRUMENTED_OWNER]: instrumentedOwner,
      [NpmScopeAttributes.INSTRUMENTED_NAME]: instrumentedName,
      [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: this.instrumentedPackage.version,
      [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: instrumentedMajor?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: instrumentedMinor?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: instrumentedPatch?.toString(),
      [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: instrumentedPreRelease?.join('.')
    }

    // Handle renamed functions
    if (this.matchingImport.rename !== undefined) {
      metricData[JsScopeAttributes.NAME] = this.jsFunction.name.replace(
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
