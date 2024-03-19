/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { ComplexValue } from '../../complex-value.js'
import getAccessPath from '../../get-access-path.js'
import type { JsToken } from '../../interfaces.js'
import type { JsFunctionTokenAccumulator } from '../../js-function-token-accumulator.js'
import { getNodeValueHandler } from '../../node-value-handler-map.js'
import { JsNodeHandler } from '../js-node-handler.js'

/**
 * Holds logic to construct a JsToken object given an ElementAccessExpression node.
 *
 */
export class ElementAccessExpressionNodeHandler extends JsNodeHandler<JsToken> {
  /**
   * Processes a ElementAccessExpression node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsFunctionTokenAccumulator instance
   * that holds the aggregated tokens state.
   */
  handle(node: ts.ElementAccessExpression, accumulator: JsFunctionTokenAccumulator) {
    const jsToken = this.getData(node)

    // expression is nested, do not capture unless it's a "simple" token
    if (node.parent.kind === ts.SyntaxKind.ElementAccessExpression) {
      // // expression is complex
      if ((node.parent as ts.ElementAccessExpression).argumentExpression !== node) {
        return
      }
    }

    // expression is nested, do not capture (will be captured by parent)
    if (node.parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
      return
    }

    accumulator.tokens.push(jsToken)
  }

  /**
   * Constructs a JsToken object from a given ElementAccessExpression type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsToken object.
   */
  getData(node: ts.ElementAccessExpression): JsToken {
    const argumentExpression = node.argumentExpression
    const data = getNodeValueHandler(argumentExpression.kind, this.sourceFile, this.logger).getData(
      argumentExpression
    )

    return {
      name:
        data instanceof ComplexValue
          ? getAccessPath(argumentExpression, this.sourceFile, this.logger).slice(-1)[0] ?? ''
          : data?.toString() ?? '',
      accessPath: getAccessPath(node, this.sourceFile, this.logger),
      startPos: node.pos,
      endPos: node.end
    }
  }
}
