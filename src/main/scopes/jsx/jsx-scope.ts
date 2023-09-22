/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JsxElementsConfig } from '../../../schemas/Schema.js'
import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyCollectorError } from '../../exceptions/empty-collector-error.js'
import { getElements } from './get-elements.js'
import { type Attribute, type JsxElement } from './interfaces.js'
import { ElementMetric } from './metrics/element-metric.js'

/**
 * Scope class dedicated to data collection from a jsx environment.
 */
export class JsxScope extends Scope {
  public override name = 'jsx' as const

  @Trace()
  public override async run(): Promise<void> {
    const collectorKeys = this.config.collect[this.name]
    if (collectorKeys === undefined || Object.keys(collectorKeys).length === 0) {
      throw new EmptyCollectorError(this.name)
    }

    const promises: Array<Promise<void>> = []

    Object.entries(collectorKeys).forEach(([key, value]) => {
      switch (key) {
        case 'elements':
          promises.push(this.collectElements(value))
          break
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Generates metrics for all discovered jsx elements found
   * in the current working directory's project.
   *
   * @param config - Determines which attributes name and values to collect for.
   */
  @Trace()
  private async collectElements(config: JsxElementsConfig): Promise<void> {
    const allowedAttributeNames: string[] = config.allowedAttributeNames ?? []
    const allowedAttributeStringValues: string[] = config.allowedAttributeStringValues ?? []
    const elements = await getElements(this.cwd, this.logger)

    const nameSubstitutions: Record<string, string> = {}
    const valueSubstitutions: Record<string, string> = {}

    elements.forEach((element: JsxElement) => {
      const { validAttributes, validValues } = this.processAttributes(
        element.attributes,
        allowedAttributeNames,
        allowedAttributeStringValues,
        nameSubstitutions,
        valueSubstitutions
      )

      this.capture(
        new ElementMetric({
          name: element.name,
          raw: element.raw,
          attributeNames: validAttributes,
          attributeValues: validValues,
          nameSubstitutions,
          valueSubstitutions
        })
      )
    })
  }

  /**
   * Given an array of attributes, a list of desired attribute names and values,
   * constructs filtered lists of valid names and values.
   * Note that a value is only valid if it is contained in the supplied
   * `allowedAttributeStringValues` and it is paired with an attribute
   * in the `allowedAttributeNames`.
   *
   * @param attributes - The array of attributes to process.
   * @param allowedAttributeNames - The list of valid attribute names.
   * @param allowedAttributeStringValues - The list of valid attribute values.
   * @param nameSubstitutions - Dictionary to use to substitute unknown attribute names.
   * @param valueSubstitutions - Dictionary to use to substitute unknown attribute values.
   * @returns Object containing sanitized validAttributes and validValues.
   */
  @Trace()
  private processAttributes(
    attributes: Attribute[],
    allowedAttributeNames: string[],
    allowedAttributeStringValues: string[],
    nameSubstitutions: Record<string, string>,
    valueSubstitutions: Record<string, string>
  ): { validAttributes: string[], validValues: string[] } {
    const validAttributes: string[] = []
    const validValues: string[] = []

    attributes.forEach((attr) => {
      if (allowedAttributeNames.includes(attr.name)) {
        validAttributes.push(attr.name)

        if (typeof attr.value === 'string') {
          if (allowedAttributeStringValues.includes(attr.value)) {
            if (validValues.includes(attr.value)) {
              validValues.push(attr.value)
            }
          } else {
            if (valueSubstitutions[attr.value] === undefined) {
              valueSubstitutions[attr.value] = `unknownAttributeValue${
                Object.keys(valueSubstitutions).length
              }`
            }
          }
        }
      } else {
        if (nameSubstitutions[attr.name] === undefined) {
          nameSubstitutions[attr.name] = `unknownAttribute${Object.keys(nameSubstitutions).length}`
        }
      }
    })

    return { validAttributes, validValues }
  }
}
