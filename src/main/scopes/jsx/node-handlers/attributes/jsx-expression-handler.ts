/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { ASTNodeHandler } from '../../ast-node-handler.js'
import { getNodeHandler } from '../../attributes-node-handler-map.js'
import { DefaultHandler } from './default-handler.js'

/**
 * Holds logic to extract data from an AST node that is a JsxExpression kind.
 *
 */
export class JsxExpressionHandler extends ASTNodeHandler {
  /**
   * Extracts string value of node.
   *
   * @param node - JsxExpression node to extract data from.
   * @returns Text value of node.
   */
  public getData(node: ts.JsxExpression) {
    if (node.expression !== null && node.expression !== undefined) {
      return getNodeHandler(node.expression.kind, this.sourceNode).getData(node.expression)
    } else {
      // return raw data of node
      return new DefaultHandler(this.sourceNode).getData(node)
    }
  }
}
