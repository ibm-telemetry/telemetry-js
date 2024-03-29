/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import type { JsToken } from '../../interfaces.js'
import type { JsFunctionTokenAccumulator } from '../../js-function-token-accumulator.js'
import { JsNodeHandler } from '../js-node-handler.js'

/**
 * Holds logic to construct a JsToken object given an Identifier node.
 *
 */
export class IdentifierNodeHandler extends JsNodeHandler<JsToken> {
  /**
   * Processes a Identifier node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsFunctionTokenAccumulator instance
   * that holds the aggregated tokens state.
   */
  handle(node: ts.Identifier, accumulator: JsFunctionTokenAccumulator) {
    // The logic below does the following:
    // foo[TOKEN] <-- capture TOKEN, not foo
    // foo[BLA['cool']] <-- capture nothing
    // thing[one.two] <-- capture nothing
    // thing.first['second'] <-- capture nothing
    if (
      node.parent.kind === ts.SyntaxKind.ElementAccessExpression &&
      (node.parent as ts.ElementAccessExpression).argumentExpression !== node
    ) {
      return
    }

    if (
      [
        ts.SyntaxKind.PropertyAccessExpression,
        ts.SyntaxKind.CallExpression,
        ts.SyntaxKind.ImportClause,
        ts.SyntaxKind.ImportDeclaration,
        ts.SyntaxKind.ImportSpecifier
      ].includes(node.parent.kind) ||
      (node.parent.kind === ts.SyntaxKind.VariableDeclaration &&
        (node.parent as ts.VariableDeclaration).name === node)
    ) {
      return
    }
    accumulator.tokens.push(this.getData(node))
  }

  /**
   * Constructs a JsToken object from a given Identifier type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsToken object.
   */
  getData(node: ts.Identifier): JsToken {
    return {
      name: node.escapedText.toString(),
      accessPath: [node.escapedText.toString()],
      startPos: node.pos,
      endPos: node.end
    }
  }
}
