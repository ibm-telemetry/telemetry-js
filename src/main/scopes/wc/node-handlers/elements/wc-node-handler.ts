/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type WcElement } from '../../interfaces.js'
import { type WcElementAccumulator } from '../../wc-element-accumulator.js'
import { isHtmlElement } from '../adapters/is-html-element.js'
import { HtmlNodeHandler } from './html-node-handler.js'
import type { Node as HtmlNode } from 'domhandler'

/**
 * Holds logic to construct a JsxElement object given a node of said kind.
 *
 */
export class WcElementNodeHandler extends HtmlNodeHandler {
  /**
   * Processes a JsxElement node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated elements state.
   */
  handle(node: HtmlNode, accumulator: WcElementAccumulator) {
    accumulator.elements.push(this.getData(node))
  }

  /**
   * Constructs a JsxElement object from a given JsxElement type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxElement object.
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

  getScriptSource(node: HtmlNode) {}
}
