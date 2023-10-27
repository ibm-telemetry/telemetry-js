/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { getNodeHandler } from '../../attributes-node-handler-map.js'
import { type JsxElementAttribute } from '../../interfaces.js'

/**
 * Holds node handling logic to be inherited by Jsx node handlers.
 *
 */
export abstract class JsxNodeHandler {
  /**
   * Given a TagName node representing a JsxElement, obtains the name and prefix values.
   *
   * @param tagName - TagName node of JsxElement to obtain name and prefix for.
   * @returns Object containing name and prefix (as strings).
   */
  protected getElementNameAndPrefix(tagName: ts.Node) {
    // TODOASKJOE
    const tagNameAsAny = tagName as any
    let name = ''
    let prefix
    if (typeof tagNameAsAny.escapedText === 'string') {
      name = tagNameAsAny.escapedText
    } else {
      prefix = tagNameAsAny.expression.escapedText
      name = tagNameAsAny.name.escapedText
    }
    return { name, prefix }
  }

  /**
   * Parses JsxAttribute nodes into an array of JsxElementAttribute.
   *
   * @param attributes - JsxAttributes node to parse attributes for.
   * @param sourceNode - Top-level root node containing raw text data (usually source file node).
   * @returns Array of parsed attributes.
   */
  protected getElementAttributes(attributes: ts.JsxAttributes, sourceNode: ts.SourceFile) {
    const attrs: JsxElementAttribute[] = []
    if (attributes.properties.length) {
      attributes.properties.forEach((attr) => {
        let name
        if (attr.name && 'escapedText' in attr.name) {
          name = attr.name.escapedText
        }
        const value = getNodeHandler(attr.kind).getData(attr, sourceNode)
        // TODOASKJOE
        attrs.push({ name, value })
      })
    }
    return attrs
  }
}
