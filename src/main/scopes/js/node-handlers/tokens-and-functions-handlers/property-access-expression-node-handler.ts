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
 * Holds logic to construct a JsToken object given an PropertyAccessExpression node.
 *
 */
export class PropertyAccessExpressionNodeHandler extends JsNodeHandler<JsToken> {
  /**
   * Processes a PropertyAccessExpression node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsFunctionTokenAccumulator instance
   * that holds the aggregated tokens state.
   */
  handle(node: ts.PropertyAccessExpression, accumulator: JsFunctionTokenAccumulator) {
    // expression is nested, do not capture unless it's a "simple" token
    if (node.parent.kind === ts.SyntaxKind.ElementAccessExpression) {
      // // expression is complex
      if ((node.parent as ts.ElementAccessExpression).argumentExpression !== node) {
        return
      }
    }

    // expression is nested, do not capture
    if (
      node.parent.kind === ts.SyntaxKind.PropertyAccessExpression ||
      node.parent.kind === ts.SyntaxKind.CallExpression
    ) {
      return
    }

    accumulator.tokens.push(this.getData(node))
  }

  /**
   * Constructs a JsToken object from a given PropertyAccessExpression type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsToken object.
   */
  getData(node: ts.PropertyAccessExpression): JsToken {
    return {
      name: node.name.escapedText.toString(),
      accessPath: getAccessPath(node, this.sourceFile, this.logger)
    }
  }
}
