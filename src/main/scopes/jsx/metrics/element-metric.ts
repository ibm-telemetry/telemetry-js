/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { type Attributes } from '@opentelemetry/api'

import { hash, substitute } from '../../../core/anonymize.js'
import { type Logger } from '../../../core/log/logger.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { getPackageDetails } from '../../utils/get-package-details.js'
import { type JsxElement } from '../interfaces.js'

/**
 * JSX scope metric that generates an element.count individual metric for a given element.
 */
export class JsxElementMetric extends ScopeMetric {
  public override name: string
  private readonly config: ConfigSchema
  private readonly data: JsxElement

  /**
   * Constructs a JsxElementMetric.
   *
   * @param data - Object containing name and version to extract data to generate metric from.
   * @param config - Determines which attributes name and values to collect for.
   * @param logger - Logger instance.
   */
  public constructor(data: JsxElement, config: ConfigSchema, logger: Logger) {
    super(logger)
    this.name = 'element.count'
    this.data = data
    this.config = config
  }

  /**
   * Get all OpenTelemetry Attributes for this metric data point.
   *
   * @returns OpenTelemetry compliant attributes, anonymized and substituted where necessary.
   */
  public override get attributes(): Attributes {
    const allowedAttributeNames: string[] =
      this.config?.collect?.jsx?.elements?.allowedAttributeNames ?? []
    const allowedAttributeStringValues: string[] =
      this.config?.collect?.jsx?.elements?.allowedAttributeStringValues ?? []
    const { owner, name: invokerName } = getPackageDetails(this.logger, this.data.importedBy)
    const metricData = hash(
      {
        ...this.data,
        'invoker.package.raw': this.data.importedBy,
        'invoker.package.owner': owner,
        'invoker.package.name': invokerName
      },
      ['raw', 'invoker.package.raw', 'invoker.package.owner', 'invoker.package.name']
    )
    metricData.attributes = substitute(
      this.data.attributes,
      allowedAttributeNames,
      allowedAttributeStringValues
    )

    return {
      raw: metricData.raw,
      name: metricData.name,
      attributeNames: metricData.attributes.map((attr) => attr.name),
      attributeValues: metricData.attributes.map((attr) => attr.value as string),
      'invoker.package.raw': metricData['invoker.package.raw'],
      'invoker.package.owner': metricData['invoker.package.owner'],
      'invoker.package.name': metricData['invoker.package.name'],
      'module.specifier': metricData.importPath
    }
  }
}
