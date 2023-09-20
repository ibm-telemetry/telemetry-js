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
import { type JsxElement } from './interfaces.js'
import { ElementMetric } from './metrics/element-metric.js'

/**
 * TODO.
 */
export class JsxScope extends Scope {
  public override name = 'jsx' as const

  @Trace()
  private async collectElements(config: JsxElementsConfig): Promise<void> {
    const allowedAttributeNames = config.allowedAttributeNames ?? []
    const allowedAttributeStringValues = config.allowedAttributeStringValues ?? []
    const elements = await getElements(this.cwd, this.logger)

    const nameSubstitutions: Record<string, string> = {}
    const valueSubstitutions: Record<string, string> = {}

    elements.forEach((element: JsxElement) => {
      const validAttributes: string[] = []
      const validValues: string[] = []

      element.attributes.forEach(attr => {
        if (allowedAttributeNames.includes(attr.name)) {
          validAttributes.push(attr.name)

          if (typeof attr.value === 'string') {
            if (allowedAttributeStringValues.includes(attr.value)) {
              if (validValues.includes(attr.value)) {
                validValues.push(attr.value)
              }
            } else {
              if (valueSubstitutions[attr.value] === undefined) {
                valueSubstitutions[attr.value] = `unknownAttributeValue${Object.keys(valueSubstitutions).length}`
              }
            }
          }
        } else {
          if (nameSubstitutions[attr.name] === undefined) {
            nameSubstitutions[attr.name] = `unknownAttribute${Object.keys(nameSubstitutions).length}`
          }
        }
      })

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
}
