/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { getAttributeNodeHandler } from '../../attributes-node-handler-map.js'
import { AttributeNodeHandler } from './attribute-node-handler.js'

/**
 * Holds logic to extract data from an AST node that is a JsxSpreadAttribute kind.
 *
 */
export class JsxSpreadAttributeHandler extends AttributeNodeHandler {
  /**
   * Extracts string value of node.
   *
   * @param node - JsxAttribute node to extract data from.
   * @returns Text value of node.
   */
  public getData(node: ts.JsxSpreadAttribute): string {
    return getAttributeNodeHandler(node.expression.kind, this.sourceFile, this.logger).getData(
      node.expression
    )
  }
}
