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
import { ElementMetric } from './metrics/element-metric.js'

interface JsxElement {
  name: string
  raw: string
  attributes: Array<{ name: string, value: any }>
}

/**
 * TODO.
 */
export class JsxScope extends Scope {
  public override name = 'jsx' as const

  @Trace()
  private async collectElements(config: JsxElementsConfig): Promise<void> {
    const allowedAttributeNames = config.allowedAttributeNames ?? []
    const allowedAttributeStringValues = config.allowedAttributeStringValues ?? []
    const elements = await this.getElements()

    const keySubstitutions: Record<string, string> = {}
    const elementSubstitutions = {}

    elements.forEach((element: JsxElement) => {
      const validAttributes = []
      const validValues = []

      element.attributes.forEach(attr => {
        if (allowedAttributeNames.includes(attr)) {
          validAttributes.push(attr)

          if (typeof attr.value === 'string' && allowedAttributeStringValues.includes(attr.value)) {
            validValues.push(attr)
          }
        } else {
          k
        }
      })

      this.capture(
        new ElementMetric({
          name: element.name,
          raw: element.raw,
          attributeNames: element.attributeNames.filter(attrName => {
            if (!allowedAttributeNames.includes(attrName)) {
              if (keySubstitutions[attrName] === undefined) {
                keySubstitutions[attrName] = `unknownAttribute${Object.keys(keySubstitutions).length + 1}`
              }
              return false
            }
            return true
          }),
          attributeValues: element.attributeValues.filter(attrValue => {
            if (!allowedAttributeStringValues.includes(attrValue)) {
              if (keySubstitutions[attrName] === undefined) {
                keySubstitutions[attrName] = `unknownAttribute${Object.keys(keySubstitutions).length + 1}`
              }
              return false
            }
            return true
          })

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
