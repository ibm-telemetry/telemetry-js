/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { NpmScopeAttributes, WcScopeAttributes } from '@ibm/telemetry-attributes-js'
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import type { Attributes } from '@opentelemetry/api'

import { hash } from '../../../core/anonymize/hash.js'
import { substituteObject } from '../../../core/anonymize/substitute-object.js'
import { deNull } from '../../../core/de-null.js'
import { type Logger } from '../../../core/log/logger.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import type { JsImport } from '../../js/interfaces.js'
import { type JsxElement } from '../../jsx/interfaces.js'
import type { PackageData } from '../../npm/interfaces.js'
import { CdnImport, type WcElement, type WcElementAttribute } from '../interfaces.js'
import { isJsImport } from '../../js/utils/is-js-import.js'
import { isCdnImport } from '../utils/is-cdn-import.js'

/**
 * Wc scope metric that generates a wc.element individual metric for a given element.
 */
export class ElementMetric extends ScopeMetric {
  public override name = 'wc.element' as const
  private readonly element: WcElement
  private readonly matchingImport: JsImport | CdnImport
  private readonly allowedAttributeNames: string[]
  private readonly allowedAttributeStringValues: string[]
  private readonly instrumentedPackage: PackageData

  /**
   * Constructs a WcElementMetric.
   *
   * @param element - Object containing name and version to extract data to generate metric from.
   * @param matchingImport - Import that matched the provided WcElement in the file.
   * @param instrumentedPackage - Data (name and version) pertaining to instrumented package.
   * @param config - Determines which attributes name and values to collect for.
   * @param logger - Logger instance.
   */
  public constructor(
    element: WcElement | JsxElement,
    matchingImport: JsImport | CdnImport,
    instrumentedPackage: PackageData,
    config: ConfigSchema,
    logger: Logger
  ) {
    super(logger)
    this.logger.debug('Element Metric started for', JSON.stringify(element))
    this.element = element
    this.matchingImport = matchingImport
    this.instrumentedPackage = instrumentedPackage

    this.allowedAttributeNames = config.collect.wc?.elements?.allowedAttributeNames ?? []
    this.allowedAttributeStringValues =
      config.collect.wc?.elements?.allowedAttributeStringValues ?? []
  }

  /**
   * Get all OpenTelemetry Attributes for this metric data point.
   *
   * @returns OpenTelemetry compliant attributes, anonymized and substituted where necessary.
   */
  public override get attributes(): Attributes {
    const attrMap = deNull(
      this.element.attributes.reduce<Record<string, WcElementAttribute['value']>>((prev, cur) => {
        return { ...prev, [cur.name]: cur.value }
      }, {})
    )

    const anonymizedAttributes = substituteObject(
      attrMap,
      this.allowedAttributeNames,
      this.allowedAttributeStringValues
    )

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
      [WcScopeAttributes.NAME]: this.element.name,
      [WcScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(anonymizedAttributes),
      [WcScopeAttributes.ATTRIBUTE_VALUES]: Object.values(anonymizedAttributes).map((attr) =>
        String(attr)
      ),
      [WcScopeAttributes.FRAMEWORK_WRAPPER]: 'vanilla',
      [NpmScopeAttributes.INSTRUMENTED_RAW]: this.instrumentedPackage.name,
      [NpmScopeAttributes.INSTRUMENTED_OWNER]: instrumentedOwner,
      [NpmScopeAttributes.INSTRUMENTED_NAME]: instrumentedName
    }

    if (isCdnImport(this.matchingImport)) {
      // add/update CDN import fields
      metricData[WcScopeAttributes.MODULE_SPECIFIER] = this.matchingImport.package
      metricData[WcScopeAttributes.IMPORT_SOURCE] = 'cdn'
      metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_RAW] = this.matchingImport.version
    } else {
      // add npm import fields
      metricData[WcScopeAttributes.MODULE_SPECIFIER] = this.matchingImport.path
      metricData[WcScopeAttributes.IMPORT_SOURCE] = 'npm'
      metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_RAW] = this.instrumentedPackage.version
      metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR] = instrumentedMajor?.toString()
      metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR] = instrumentedMinor?.toString()
      metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH] = instrumentedPatch?.toString()
      metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE] =
        instrumentedPreRelease?.join('.')
    }

    // Handle renamed elements
    if (isJsImport(this.matchingImport)) {
      // type guarding needed
      if (this.matchingImport.rename !== undefined) {
        metricData[WcScopeAttributes.NAME] = this.element.name.replace(
          this.matchingImport.rename,
          this.matchingImport.name
        )
      }
    }

    // Handle different import path from module specifier
    if (this.matchingImport.path !== this.instrumentedPackage.name) {
      metricData[WcScopeAttributes.MODULE_SPECIFIER] = this.instrumentedPackage.name
    }

    // Handle wrappers

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
