/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Attributes } from '@opentelemetry/api'

import { type JsxElementsConfig } from '../../../../schemas/Schema.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { type JsxElement } from '../interfaces.js'

/**
 * JSX scope metric that generates an element.count individual metric for a given element.
 */
export class JsxElementMetric extends ScopeMetric {
  public override name: string
  private readonly config: JsxElementsConfig
  private data: JsxElement

  /**
   * Constructs a JsxElementMetric.
   *
   * @param data - Object containing name and version to extract data to generate metric from.
   * @param config - Determines which attributes name and values to collect for.
   */
  public constructor(data: JsxElement, config: JsxElementsConfig) {
    super()
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
    const allowedAttributeNames: string[] = this.config.allowedAttributeNames ?? []
    const allowedAttributeStringValues: string[] = this.config.allowedAttributeStringValues ?? []
    // TODO: pull in these functions when available
    this.data = hash(this.data, ['raw'])
    this.data.attributes = substitute(this.data.attributes, allowedAttributeNames, allowedAttributeStringValues)
    return {
      raw: this.data.raw,
      name: this.data.name,
      attributeNames: this.data.attributes.map(attr => attr.name),
      attributeValues: this.data.attributes.map(attr => attr.value as string)
    }
  }
}
