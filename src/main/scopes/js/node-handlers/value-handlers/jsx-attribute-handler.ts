/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { getNodeValueHandler } from '../../node-value-handler-map.js'
import { NodeValueHandler } from './node-value-handler.js'
import { TrueKeywordHandler } from './true-keyword-handler.js'

/**
 * Holds logic to extract data from an AST node that is a JsxAttribute kind.
 *
 */
export class JsxAttributeHandler extends NodeValueHandler {
  /**
   * Extracts string value of node.
   *
   * @param node - JsxAttribute node to extract data from.
   * @returns Text value of node.
   * @throws NoAttributeExpressionFoundError if node's expression is undefined.
   */
  public getData(node: ts.JsxAttribute) {
    if (node.initializer === undefined) {
      return new TrueKeywordHandler(this.sourceFile, this.logger).getData(node)
    }
    return getNodeValueHandler(node.initializer.kind, this.sourceFile, this.logger).getData(
      node.initializer
    )
  }
}
