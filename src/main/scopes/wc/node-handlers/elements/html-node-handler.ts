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
import { HtmlParsedFile, WcElement, WcElementAttribute } from '../../interfaces.js'
import type { Element as HtmlElement } from 'domhandler'

/**
 * Holds node handling logic to be inherited by Jsx node handlers.
 *
 */
export abstract class HtmlNodeHandler extends JsNodeHandler<WcElement, HtmlParsedFile> {
  /**
   * Given a TagName node representing a JsxElement, obtains the name and prefix values.
   *
   * @param tagName - TagName node of JsxElement to obtain name and prefix for.
   * @returns Object containing name and prefix (as strings).
   */
  @Trace({ argFormatter: (arg: HtmlElement) => arg.name })
  protected getElementName(node: HtmlElement) {
    return node.name
  }

  /**
   * Parses JsxAttribute nodes into an array of JsxElementAttribute.
   *
   * @param attributes - JsxAttributes node to parse attributes for.
   * @returns Array of parsed attributes.
   */
  @Trace({ argFormatter: (arg: HtmlElement) => arg.attribs })
  protected getElementAttributes(element: HtmlElement): WcElementAttribute[] {
    const attrs: WcElementAttribute[] = []

    if (!element.attribs) {
      return attrs
    }

    for (const [name, value] of Object.entries(element.attribs)) {
      attrs.push({
        name,
        value
      })
    }

    return attrs
  }
}
