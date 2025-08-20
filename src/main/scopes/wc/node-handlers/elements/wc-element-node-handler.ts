/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Node as HtmlNode } from 'domhandler'

import { type WcElement } from '../../interfaces.js'
import { isHtmlElement } from '../../utils/is-html-element.js'
import { type WcElementAccumulator } from '../../wc-element-accumulator.js'
import { HtmlNodeHandler } from './html-node-handler.js'

/**
 * Holds logic to construct a WcElement object given a node of said kind.
 *
 */
export class WcElementNodeHandler extends HtmlNodeHandler {
  /**
   * Processes a WcElement node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - WcAccumulator instance that holds the aggregated elements state.
   */
  handle(node: HtmlNode, accumulator: WcElementAccumulator) {
    accumulator.elements.push(this.getData(node))
  }

  /**
   * Constructs a WcElement object from a given WcElement type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed WcElement object.
   * @throws Error if its not an HtmlElement.
   */
  getData(node: HtmlNode): WcElement {
    if (!isHtmlElement(node)) {
      throw new Error('Expected an Element node')
    }

    const name = this.getElementName(node)
    const attributes = this.getElementAttributes(node)

    return {
      name,
      attributes
    }
  }

  //   getScriptSource(node: HtmlNode) {}
}
