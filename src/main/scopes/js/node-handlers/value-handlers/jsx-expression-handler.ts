/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { NoAttributeExpressionFoundError } from '../../../../exceptions/no-attribute-expression-found-error.js'
import { getNodeValueHandler } from '../../node-value-handler-map.js'
import { NodeValueHandler } from './node-value-handler.js'

/**
 * Holds logic to extract data from an AST node that is a JsxExpression kind.
 *
 */
export class JsxExpressionHandler extends NodeValueHandler {
  /**
   * Extracts string value of node.
   *
   * @param node - JsxExpression node to extract data from.
   * @returns Text value of node.
   * @throws NoAttributeExpressionFoundError if node's expression is undefined.
   */
  public getData(node: ts.JsxExpression) {
    if (node.expression === undefined) {
      throw new NoAttributeExpressionFoundError(node.getText(this.sourceFile))
    }

    return getNodeValueHandler(node.expression.kind, this.sourceFile, this.logger).getData(
      node.expression
    )
  }
}
