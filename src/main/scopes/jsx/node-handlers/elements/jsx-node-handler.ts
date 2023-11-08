/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { Trace } from '../../../../core/log/trace.js'
import { getAttributeNodeHandler } from '../../attributes-node-handler-map.js'
import { ElementNodeHandler } from '../../element-node-handler.js'
import { type JsxElement, type JsxElementAttribute } from '../../interfaces.js'

/**
 * Holds node handling logic to be inherited by Jsx node handlers.
 *
 */
export abstract class JsxNodeHandler extends ElementNodeHandler<JsxElement> {
  /**
   * Given a TagName node representing a JsxElement, obtains the name and prefix values.
   *
   * @param tagName - TagName node of JsxElement to obtain name and prefix for.
   * @returns Object containing name and prefix (as strings).
   */
  protected getElementNameAndPrefix(tagName: ts.JsxTagNameExpression) {
    const [prefix, ...name] = tagName.getText(this.sourceFile).split('.')
    return { name: name.join('.'), prefix }
  }

  /**
   * Parses JsxAttribute nodes into an array of JsxElementAttribute.
   *
   * @param attributes - JsxAttributes node to parse attributes for.
   * @returns Array of parsed attributes.
   */
  @Trace()
  protected getElementAttributes(attributes: ts.JsxAttributes) {
    const attrs: JsxElementAttribute[] = []

    attributes.properties.forEach((attr) => {
      // Skip attributes without valid names
      if (!attr.name) {
        return
      }
      if (!('escapedText' in attr.name)) {
        return
      }

      const value = getAttributeNodeHandler(attr.kind, this.sourceFile, this.logger).getData(attr)

      attrs.push({
        name: attr.name.escapedText.toString(),
        value
      })
    })

    return attrs
  }
}
