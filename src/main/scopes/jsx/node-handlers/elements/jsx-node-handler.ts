/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { Trace } from '../../../../core/log/trace.js'
import { NoAttributeExpressionFoundError } from '../../../../exceptions/no-attribute-expression-found-error.js'
import { JsNodeHandler } from '../../../js/node-handlers/js-node-handler.js'
import { getNodeValueHandler } from '../../../js/node-value-handler-map.js'
import { type JsxElement, type JsxElementAttribute } from '../../interfaces.js'

/**
 * Holds node handling logic to be inherited by Jsx node handlers.
 *
 */
export abstract class JsxNodeHandler extends JsNodeHandler<JsxElement> {
  /**
   * Given a TagName node representing a JsxElement, obtains the name and prefix values.
   *
   * @param tagName - TagName node of JsxElement to obtain name and prefix for.
   * @returns Object containing name and prefix (as strings).
   */
  @Trace({ argFormatter: (arg: ts.JsxTagNameExpression) => arg.getText() })
  protected getElementNameAndPrefix(tagName: ts.JsxTagNameExpression) {
    const chunks = tagName.getText(this.sourceFile).split('.')
    const [prefix, ...name] = chunks.length === 1 ? [undefined, chunks] : chunks
    return { name: name.join('.'), prefix }
  }

  /**
   * Parses JsxAttribute nodes into an array of JsxElementAttribute.
   *
   * @param attributes - JsxAttributes node to parse attributes for.
   * @returns Array of parsed attributes.
   */
  @Trace({ argFormatter: (arg: ts.JsxAttributes) => arg.getText() })
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

      try {
        attrs.push({
          name: attr.name.escapedText.toString(),
          value: getNodeValueHandler(attr.kind, this.sourceFile, this.logger).getData(attr)
        })
      } catch (e) {
        if (e instanceof NoAttributeExpressionFoundError) {
          this.logger.error(e)
        } else {
          throw e
        }
      }
    })

    return attrs
  }
}
