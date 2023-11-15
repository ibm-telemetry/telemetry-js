/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { getAttributeNodeHandler } from '../../attributes-node-handler-map.js'
import { AttributeNodeHandler } from './attribute-node-handler.js'
import { TrueKeywordHandler } from './true-keyword-handler.js'

/**
 * Holds logic to extract data from an AST node that is a JsxAttribute kind.
 *
 */
export class JsxAttributeHandler extends AttributeNodeHandler {
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
    return getAttributeNodeHandler(node.initializer.kind, this.sourceFile, this.logger).getData(
      node.initializer
    )
  }
}
