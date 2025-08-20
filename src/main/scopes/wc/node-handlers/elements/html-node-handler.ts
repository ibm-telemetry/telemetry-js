/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Element as HtmlElement } from 'domhandler'

import { Trace } from '../../../../core/log/trace.js'
import { JsNodeHandler } from '../../../js/node-handlers/js-node-handler.js'
import { HtmlParsedFile, WcElement, WcElementAttribute } from '../../interfaces.js'

/**
 * Holds node handling logic to be inherited by Wc node handlers.
 *
 */
export abstract class HtmlNodeHandler extends JsNodeHandler<WcElement, HtmlParsedFile> {
  /**
   * Given a TagName node representing a WcElement, obtains the name and prefix values.
   *
   * @param node - Node to query.
   * @returns Object containing name and prefix (as strings).
   */
  @Trace({ argFormatter: (arg: HtmlElement) => arg.name })
  protected getElementName(node: HtmlElement) {
    return node.name
  }

  /**
   * Parses WcAttribute nodes into an array of WcElementAttribute.
   *
   * @param element - WcAttributes node to parse attributes for.
   * @returns Array of parsed attributes.
   */
  @Trace({ argFormatter: (arg: HtmlElement) => arg.attribs })
  protected getElementAttributes(element: HtmlElement): WcElementAttribute[] {
    const attrs: WcElementAttribute[] = []

    if (element.attribs == undefined) {
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
