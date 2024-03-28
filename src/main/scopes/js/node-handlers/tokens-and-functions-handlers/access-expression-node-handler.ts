/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import getAccessPath from '../../get-access-path.js'
import type { JsToken } from '../../interfaces.js'
import type { JsFunctionTokenAccumulator } from '../../js-function-token-accumulator.js'
import { JsNodeHandler } from '../js-node-handler.js'

/**
 * Holds logic to construct a JsToken object given an ElementAccessExpression or
 * PropertyAccessExpression node.
 *
 */
export class AccessExpressionNodeHandler extends JsNodeHandler<JsToken> {
  /**
   * Processes a node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsFunctionTokenAccumulator instance
   * that holds the aggregated tokens state.
   */
  handle(
    node: ts.ElementAccessExpression | ts.PropertyAccessExpression,
    accumulator: JsFunctionTokenAccumulator
  ) {
    // The logic below does the following:
    // foo['bla']['cool'] <-- capture foo,blah,cool
    // foo[BLA['cool']] <-- capture BLA,cool NOT foo,ComplexValue
    // thing[one.two] <-- capture one,two NOT thing,ComplexValue
    // thing.first['second'] <-- capture thing,first,second NOT thing,first
    if (
      node.parent.kind === ts.SyntaxKind.ElementAccessExpression &&
      (node.parent as ts.ElementAccessExpression).argumentExpression !== node
    ) {
      return
    }

    // expression is part of a larger property access or function call
    if (
      [ts.SyntaxKind.PropertyAccessExpression, ts.SyntaxKind.CallExpression].includes(
        node.parent.kind
      )
    ) {
      return
    }

    accumulator.tokens.push(this.getData(node))
  }

  /**
   * Constructs a JsToken object from a given ElementAccessExpression or PropertyAccessExpression
   * type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsToken object.
   */
  getData(node: ts.ElementAccessExpression | ts.PropertyAccessExpression): JsToken {
    return {
      // TODO: this might contain element access expressions that need to be anonymized. need to
      // anonymize later based on complex values from the accessPath (global string replace)
      name: node.getText(this.sourceFile),
      accessPath: getAccessPath(node, this.sourceFile, this.logger),
      startPos: node.pos,
      endPos: node.end
    }
  }
}
