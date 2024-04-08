/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsScopeAttributes, NpmScopeAttributes } from '@ibm/telemetry-attributes-js'
import type { ConfigSchema } from '@ibm/telemetry-config-schema'
import type { Attributes } from '@opentelemetry/api'

import { hash } from '../../../core/anonymize/hash.js'
import { substituteArray } from '../../../core/anonymize/substitute-array.js'
import type { Logger } from '../../../core/log/logger.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import type { PackageData } from '../../npm/interfaces.js'
import type { JsFunction, JsImport } from '../interfaces.js'

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
   * Constructs a FunctionMetric.
   *
   * @param jsFunction - Object containing function data to generate metric from.
   * @param matchingImport - Import that matched the provided JsFunction in the file.
   * @param instrumentedPackage - Data (name and version) pertaining to instrumented package.
   * @param config - Determines which argument values to collect for.
   * @param logger - Logger instance.
   */
  public constructor(
    jsFunction: JsFunction,
    matchingImport: JsImport,
    instrumentedPackage: PackageData,
    config: ConfigSchema,
    logger: Logger
  ) {
    super(logger)
    this.jsFunction = { ...jsFunction }
    this.matchingImport = matchingImport
    this.instrumentedPackage = instrumentedPackage

    this.allowedArgumentStringValues =
      config.collect.js?.functions?.allowedArgumentStringValues ?? []
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

    // Handle renamed functions
    if (this.matchingImport.rename !== undefined) {
      this.jsFunction.name = this.jsFunction.name.replace(
        this.matchingImport.rename,
        this.matchingImport.name
      )
      // replace the import name in access path
      this.jsFunction.accessPath[0] = this.matchingImport.name
    }

    let metricData: Attributes = {
      // TODOASKJOE: does this need a specifier?
      [JsScopeAttributes.FUNCTION_NAME]: this.jsFunction.name,
      // TODOASKJOE: should this be a string? as per TD
      [JsScopeAttributes.FUNCTION_ACCESS_PATH]: substituteArray(
        this.jsFunction.accessPath,
        this.jsFunction.accessPath.filter((p) => typeof p === 'string')
      ) as string[],
      [JsScopeAttributes.FUNCTION_ARGUMENT_VALUES]: substituteArray(
        this.jsFunction.arguments,
        this.allowedArgumentStringValues
      ).map((arg) => String(arg)),
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
