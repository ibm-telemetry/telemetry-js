/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import getAccessPath from '../../get-access-path.js'
import type { JsFunction } from '../../interfaces.js'
import type { JsFunctionTokenAccumulator } from '../../js-function-token-accumulator.js'
import { getNodeValueHandler } from '../../node-value-handler-map.js'
import { JsNodeHandler } from '../js-node-handler.js'

/**
 * Holds logic to construct a JsFunction object given an CallExpression node.
 *
 */
export class CallExpressionNodeHandler extends JsNodeHandler<JsFunction> {
  /**
   * Processes a CallExpression node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsFunctionTokenAccumulator instance
   * that holds the aggregated functions state.
   */
  handle(node: ts.CallExpression, accumulator: JsFunctionTokenAccumulator) {
    const jsFunction = this.getData(node)

    accumulator.functions.push(jsFunction)
  }

  /**
   * Constructs a JsFunction object from a given CallExpression type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsFunction object.
   */
  getData(node: ts.CallExpression): JsFunction {
    const argsLength = node.arguments.end - node.arguments.pos
    const nodeText = node.getText(this.sourceFile)
    const jsFunction: JsFunction = {
      // account for parentheses
      name: nodeText.substring(0, nodeText.length - argsLength - 2),
      accessPath: [],
      arguments: [],
      startPos: node.pos,
      endPos: node.end
    }

    jsFunction.arguments = node.arguments.map((arg) =>
      getNodeValueHandler(arg.kind, this.sourceFile, this.logger).getData(arg)
    )

    jsFunction.accessPath = getAccessPath(node, this.sourceFile, this.logger)

    return jsFunction
  }
}
