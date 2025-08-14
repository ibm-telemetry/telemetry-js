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
import { isJsImport } from '../../js/utils/is-js-import.js'
import { type JsxElement } from '../../jsx/interfaces.js'
import type { PackageData } from '../../npm/interfaces.js'
import type { CdnImport } from '../interfaces.js'
import { type WcElement, type WcElementAttribute } from '../interfaces.js'
import { isCdnImport } from '../utils/is-cdn-import.js'
import { isJsxElement } from '../utils/is-jsx-element.js'
import { WC_PACKAGE_REACT_WRAPPERS } from '../wc-defs.js'

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
      [NpmScopeAttributes.INSTRUMENTED_RAW]: this.instrumentedPackage.name,
      [NpmScopeAttributes.INSTRUMENTED_OWNER]: instrumentedOwner,
      [NpmScopeAttributes.INSTRUMENTED_NAME]: instrumentedName,
      [WcScopeAttributes.FRAMEWORK_WRAPPER]: 'none'
    }

    let hashVersionRaw = true

    if (isCdnImport(this.matchingImport)) {
      // add fields specific to CDN imports
      metricData[WcScopeAttributes.IMPORT_SOURCE] = 'cdn'
      metricData[WcScopeAttributes.MODULE_SPECIFIER] = this.matchingImport.package
      const importTag = this.matchingImport.version.split('/')[1]
      if (importTag === 'latest' || importTag === 'next') {
        metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_RAW] = this.matchingImport.version
        hashVersionRaw = false
      } else {
        // CDN import expected to specify version
        const parsedVersion = this.matchingImport.version.split('v')[1]?.split('.') ?? []
        metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_RAW] = parsedVersion.join('.')
        metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR] = parsedVersion[0]
        metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR] = parsedVersion[1]
        metricData[NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH] = parsedVersion[2]
      }
    } else {
      // add fields specific to npm imports
      metricData[WcScopeAttributes.IMPORT_SOURCE] = 'npm'
      metricData[WcScopeAttributes.MODULE_SPECIFIER] = this.matchingImport.path
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
          this.matchingImport.name,
          this.matchingImport.rename
        )
      }
    }

    // Handle different import path from module specifier
    if (this.matchingImport.path !== this.instrumentedPackage.name) {
      metricData[WcScopeAttributes.MODULE_SPECIFIER] = this.instrumentedPackage.name
    }

    // Handle React wrappers
    if (isJsxElement(this.element)) {
      const parsedPath = this.matchingImport.path.split(this.instrumentedPackage.name)[1]
      const wrapperFolder = WC_PACKAGE_REACT_WRAPPERS.get(this.instrumentedPackage.name)
      if (wrapperFolder !== undefined && parsedPath?.split('/').includes(wrapperFolder)) {
        metricData[WcScopeAttributes.FRAMEWORK_WRAPPER] = 'react'
      }
    }

    const hashedAttributes = [
      NpmScopeAttributes.INSTRUMENTED_RAW,
      NpmScopeAttributes.INSTRUMENTED_OWNER,
      NpmScopeAttributes.INSTRUMENTED_NAME,
      NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE
    ] as [string | number, ...(string | number)[]]

    if (hashVersionRaw) {
      hashedAttributes.push(NpmScopeAttributes.INSTRUMENTED_VERSION_RAW)
    }

    metricData = hash(metricData, hashedAttributes)

    return metricData
  }
}
