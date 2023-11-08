/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { type Attributes } from '@opentelemetry/api'

import { hash, substitute } from '../../../core/anonymize.js'
import { CustomResourceAttributes } from '../../../core/custom-resource-attributes.js'
import { type Logger } from '../../../core/log/logger.js'
import { PackageDetailsProvider } from '../../../core/package-details-provider.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { type JsxElement, type JsxImport } from '../interfaces.js'

/**
 * JSX scope metric that generates an element.count individual metric for a given element.
 */
export class ElementMetric extends ScopeMetric {
  public override name = 'element.count' as const
  private readonly jsxElement: JsxElement
  private readonly matchingImport: JsxImport
  private readonly invoker: string
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
    invoker: string,
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
    if (this.invoker === undefined) {
      throw new Error('Invoker not set at time of attribute collection')
    }

    const packageDetails = new PackageDetailsProvider(this.logger).getPackageDetails(this.invoker)

    let metricData = {
      raw: this.jsxElement.raw,
      name: this.jsxElement.name,
      'module.specifier': this.matchingImport.path,
      'attribute.names': this.jsxElement.attributes.map((attr) => attr.name),
      'attribute.values': this.jsxElement.attributes.map((attr) => attr.value),
      'invoker.package.raw': this.invoker,
      'invoker.package.owner': packageDetails.owner,
      'invoker.package.name': packageDetails.name
    }

    // Handle renamed elements
    if (this.matchingImport.rename !== undefined) {
      metricData[CustomResourceAttributes.NAME] = this.jsxElement.name.replace(
        this.matchingImport.rename,
        this.matchingImport.name
      )
    }

    metricData = hash(metricData, [
      'raw',
      'invoker.package.raw',
      'invoker.package.owner',
      'invoker.package.name'
    ])

    metricData = substitute(
      metricData,
      this.allowedAttributeNames,
      this.allowedAttributeStringValues
    )

    return metricData
  }
}
