/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type PartialJsxElement } from '../../interfaces.js'
import { type JsxScopeAccumulator } from '../../jsx-scope-accumulator.js'
import { JsxNodeHandler } from './jsx-node-handler.js'

/**
 * Holds logic to construct a JsxElement object given a JsxSelfClosingElement node.
 *
 */
export class JsxSelfClosingElementNodeHandler extends JsxNodeHandler {
  /**
   * Processes a JsxElement node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated elements state.
   */
  public override handle(node: ts.JsxSelfClosingElement, accumulator: JsxScopeAccumulator) {
    accumulator.storeElement(this.getData(node))
  }

  /**
   * Constructs a JsxElement object from a given JsxSelfClosingElement type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxElement object.
   */
  getData(node: ts.JsxSelfClosingElement): PartialJsxElement {
    const { name, prefix } = this.getElementNameAndPrefix(node.tagName)

    return {
      name,
      prefix,
      attributes: this.getElementAttributes(node.attributes),
      raw: this.sourceNode.text.substring(node.pos, node.end).trim(),
      importPath: this.sourceNode.fileName
    }
  }
}
