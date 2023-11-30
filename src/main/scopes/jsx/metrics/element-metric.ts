/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { Attributes } from '@opentelemetry/api'

import { hash } from '../../../core/anonymize/hash.js'
import { substitute } from '../../../core/anonymize/substitute.js'
import { deNull } from '../../../core/de-null.js'
import { type Logger } from '../../../core/log/logger.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { type JsxElement, type JsxElementAttribute, type JsxImport } from '../interfaces.js'
import { JsxScopeAttributes } from '../jsx-scope-attributes.js'

/**
 * JSX scope metric that generates an element.count individual metric for a given element.
 */
export class ElementMetric extends ScopeMetric {
  public override name = 'element.count' as const
  private readonly jsxElement: JsxElement
  private readonly matchingImport: JsxImport
  private readonly invoker: string | undefined
  private readonly allowedAttributeNames: string[]
  private readonly allowedAttributeStringValues: string[]

  /**
   * Constructs a JsxElementMetric.
   *
   * @param jsxElement - Object containing name and version to extract data to generate metric from.
   * @param matchingImport - Import that matched the provided JsxElement in the file.
   * @param invoker - Name of the package that invoked the JsxElement.
   * @param config - Determines which attributes name and values to collect for.
   * @param logger - Logger instance.
   */
  public constructor(
    jsxElement: JsxElement,
    matchingImport: JsxImport,
    invoker: string | undefined,
    config: ConfigSchema,
    logger: Logger
  ) {
    super(logger)
    this.jsxElement = jsxElement
    this.matchingImport = matchingImport
    this.invoker = invoker

    this.allowedAttributeNames = config.collect.jsx?.elements?.allowedAttributeNames ?? []
    this.allowedAttributeStringValues =
      config.collect.jsx?.elements?.allowedAttributeStringValues ?? []
  }

  /**
   * Get all OpenTelemetry Attributes for this metric data point.
   *
   * @returns OpenTelemetry compliant attributes, anonymized and substituted where necessary.
   */
  public override get attributes(): Attributes {
    let invokingPackageDetails

    if (this.invoker !== undefined) {
      invokingPackageDetails = new PackageDetailsProvider(this.logger).getPackageDetails(
        this.invoker
      )
    }

    const attrMap = deNull(
      this.jsxElement.attributes.reduce<Record<string, JsxElementAttribute['value']>>(
        (prev, cur) => {
          return { ...prev, [cur.name]: cur.value }
        },
        {}
      )
    )

    const anonymizedAttributes = substitute(
      attrMap,
      this.allowedAttributeNames,
      this.allowedAttributeStringValues
    )

    let metricData: Attributes = {
      [JsxScopeAttributes.NAME]: this.jsxElement.name,
      [JsxScopeAttributes.MODULE_SPECIFIER]: this.matchingImport.path,
      [JsxScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(anonymizedAttributes),
      [JsxScopeAttributes.ATTRIBUTE_VALUES]: Object.values(anonymizedAttributes).map((attr) =>
        String(attr)
      ),
      [JsxScopeAttributes.INVOKER_PACKAGE_RAW]: this.invoker,
      [JsxScopeAttributes.INVOKER_PACKAGE_OWNER]: invokingPackageDetails?.owner,
      [JsxScopeAttributes.INVOKER_PACKAGE_NAME]: invokingPackageDetails?.name
    }

    // Handle renamed elements
    if (this.matchingImport.rename !== undefined) {
      metricData[JsxScopeAttributes.NAME] = this.jsxElement.name.replace(
        this.matchingImport.rename,
        this.matchingImport.name
      )
    }

    metricData = hash(metricData, [
      JsxScopeAttributes.INVOKER_PACKAGE_RAW,
      JsxScopeAttributes.INVOKER_PACKAGE_OWNER,
      JsxScopeAttributes.INVOKER_PACKAGE_NAME
    ])

    return metricData
  }
}
