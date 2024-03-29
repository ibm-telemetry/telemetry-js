/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

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
    accumulator.tokens.push(this.getData(node))
  }

  /**
   * Constructs a JsToken object from a given Identifier type AST node.
   *
   * @param _node - Node element to process.
   * @returns Constructed JsToken object.
   */
  getData(_node: ts.Identifier): JsToken {
    // TODO: implement, how to know this is not a part of a
    // CallExpression, PropertyAccessExpression or ElementAccessExpression?
    return {
      name: 'dummyToken',
      accessPath: 'dummyAccess'
    }
  }
}
