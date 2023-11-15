/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type JsxElement } from '../../interfaces.js'
import { type JsxElementAccumulator } from '../../jsx-element-accumulator.js'
import { JsxNodeHandler } from './jsx-node-handler.js'

/**
 * Holds logic to construct a JsxElement object given a node of said kind.
 *
 */
export class JsxElementNodeHandler extends JsxNodeHandler {
  /**
   * Processes a JsxElement node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated elements state.
   */
  handle(node: ts.JsxElement, accumulator: JsxElementAccumulator) {
    accumulator.elements.push(this.getData(node))
  }

  /**
   * Constructs a JsxElement object from a given JsxElement type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxElement object.
   */
  getData(node: ts.JsxElement): JsxElement {
    const { name, prefix } = this.getElementNameAndPrefix(node.openingElement.tagName)
    const attributes = node.openingElement.attributes
    return {
      name,
      prefix,
      attributes: this.getElementAttributes(attributes),
      raw: this.sourceFile.text.substring(node.pos, node.end).trim()
    }
  }
}
