/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { ASTNodeHandler } from '../../ast-node-handler.js'
import { getNodeHandler } from '../../attributes-node-handler-map.js'
import { type JsxElementAttribute } from '../../interfaces.js'

/**
 * Holds node handling logic to be inherited by Jsx node handlers.
 *
 */
export abstract class JsxNodeHandler extends ASTNodeHandler {
  /**
   * Given a TagName node representing a JsxElement, obtains the name and prefix values.
   *
   * @param tagName - TagName node of JsxElement to obtain name and prefix for.
   * @returns Object containing name and prefix (as strings).
   */
  protected getElementNameAndPrefix(tagName: ts.JsxTagNameExpression) {
    const [name, prefix] = tagName.getText(this.sourceNode).split('.')
    return { name, prefix }
  }

  /**
   * Parses JsxAttribute nodes into an array of JsxElementAttribute.
   *
   * @param attributes - JsxAttributes node to parse attributes for.
   * @returns Array of parsed attributes.
   */
  protected getElementAttributes(attributes: ts.JsxAttributes) {
    const attrs: JsxElementAttribute[] = []
    if (attributes.properties.length) {
      attributes.properties.forEach((attr) => {
        let name
        if (attr.name && 'escapedText' in attr.name) {
          name = attr.name.escapedText.toString()
        }
        const value = getNodeHandler(attr.kind, this.sourceNode).getData(attr)
        attrs.push({ name, value })
      })
    }
    return attrs
  }
}
