/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type ASTNodeHandler, type PartialJsxElement } from '../interfaces.js'
import { type JsxScopeAccumulator } from '../jsx-scope-accumulator.js'
import { JsxNodeHandler } from './jsx-node-handler.js'

/**
 * Holds logic to construct a JsxElement object given a node of said kind.
 *
 */
export class JsxElementNodeHandler extends JsxNodeHandler implements ASTNodeHandler {
  /**
   * Processes a JsxElement node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated elements state.
   */
  public handle(node: ts.Node, accumulator: JsxScopeAccumulator) {
    accumulator.storeElement(this.getJsxElementData(node as ts.JsxElement))
  }

  /**
   * Constructs a JsxElement object from a given JsxElement type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxElement object.
   */
  private getJsxElementData(node: ts.JsxElement): PartialJsxElement {
    const { name, prefix } = this.getElementNameAndPrefix(node.openingElement.tagName)
    return {
      name,
      prefix,
      attributes: this.getElementAttributes(node.openingElement.attributes),
      pos: node.pos,
      end: node.end
    }
  }
}
