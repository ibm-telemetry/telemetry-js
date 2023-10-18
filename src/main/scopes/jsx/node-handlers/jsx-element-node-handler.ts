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
   * @param rootNode - Root Node of node tree.
   */
  public handle(node: ts.Node, accumulator: JsxScopeAccumulator, rootNode: ts.Node) {
    accumulator.storeElement(this.getJsxElementData(node as ts.JsxElement, rootNode as ts.SourceFile))
  }

  /**
   * Constructs a JsxElement object from a given JsxElement type AST node.
   *
   * @param node - Node element to process.
   * @param rootNode - Root Node of node tree.
   * @returns Constructed JsxElement object.
   */
  private getJsxElementData(node: ts.JsxElement, rootNode: ts.SourceFile): PartialJsxElement {
    const { name, prefix } = this.getElementNameAndPrefix(node.openingElement.tagName)
    return {
      name,
      prefix,
      attributes: this.getElementAttributes(node.openingElement.attributes),
      raw: rootNode.text.substring(node.pos, node.end).trim()
    }
  }
}
