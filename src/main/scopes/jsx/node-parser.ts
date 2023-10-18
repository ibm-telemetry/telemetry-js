/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { type ASTNodeHandler } from './interfaces.js'
import { type JsxScopeAccumulator } from './jsx-scope-accumulator.js'

/**
 * Class to handle traversing through a node's children and calling appropriate handlers.
 *
 */
export class NodeParser {
  private readonly accumulator: JsxScopeAccumulator
  // TODOASKJOE
  // private readonly nodeHandlerMap: Record<Partial<ts.SyntaxKind>, ASTNodeHandler>
  private readonly nodeHandlerMap: Record<number, ASTNodeHandler>

  /**
   * Instantiates a new NodeParser.
   *
   * @param accumulator - Keeps the state of the collected data (by the handlers).
   * @param nodeHandlerMap - Determines what handlers (instances) are called given
   * the found node types.
   */
  constructor(accumulator: JsxScopeAccumulator, nodeHandlerMap: Record<number, ASTNodeHandler>) {
    this.accumulator = accumulator
    this.nodeHandlerMap = nodeHandlerMap
  }

  /**
   * Visits each children (recursively) of the supplied node and
   * calls out to the appropriate node handlers.
   *
   * @param node - Node to traverse through (usually a file node).
   * @param rootNode - Root Node of node tree.
   */
  public visit(node: ts.Node, rootNode: ts.Node = node) {
    const handler = this.nodeHandlerMap[node.kind]

    if (handler !== undefined) {
      handler.handle(node, this.accumulator, rootNode)
    }

    ts.forEachChild(node, (node) => { this.visit(node, rootNode) })
  }
}
