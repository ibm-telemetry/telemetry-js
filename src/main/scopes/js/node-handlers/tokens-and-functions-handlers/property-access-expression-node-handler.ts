/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import getAccessPath from '../../get-access-path.js'
import { JsToken } from '../../interfaces.js'
import { JsFunctionTokenAccumulator } from '../../js-function-token-accumulator.js'
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
    const jsToken = this.getData(node)

    // do not double capture, ex: object['property'].anotherFunction()
    // generates only 1 JsFunction and no JsToken
    const functionExists = accumulator.functions.some(
      (f) =>
        f.startPos <= jsToken.startPos &&
        f.endPos >= jsToken.endPos &&
        f.accessPath.join('.').includes(jsToken.accessPath.join('.'))
    )

    if (functionExists) {
      return
    }

    // do not double capture, ex: object['property'].anotherProperty['prop']
    // generates only 1 JsToken
    const tokenExists = accumulator.tokens.some(
      (t) =>
        t.startPos <= jsToken.startPos &&
        t.endPos >= jsToken.endPos &&
        t.accessPath.join('.').includes(jsToken.accessPath.join('.'))
    )

    if (tokenExists) {
      return
    }

    accumulator.tokens.push(jsToken)
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
      accessPath: getAccessPath(node, this.sourceFile, this.logger),
      startPos: node.pos,
      endPos: node.pos
    }
  }
}
