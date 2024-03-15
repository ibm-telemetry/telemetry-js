/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import type { JsFunction } from '../../interfaces.js'
import type { JsFunctionTokenAccumulator } from '../../js-function-token-accumulator.js'
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
    accumulator.functions.push(this.getData(node))
  }

  /**
   * Constructs a JsFunction object from a given CallExpression type AST node.
   *
   * @param _node - Node element to process.
   * @returns Constructed JsFunction object.
   */
  getData(_node: ts.CallExpression): JsFunction {
    // TODO: implement
    return {
      name: 'dummyFunction',
      accessPath: 'dummyAccess',
      arguments: []
    }
  }
}
