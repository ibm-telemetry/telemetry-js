/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { getNodeHandler } from '../../attributes-node-handler-map.js'
import { type ASTNodeHandler } from '../../interfaces.js'
import { DefaultHandler } from './default-handler.js'

/**
 * Holds logic to extract data from an AST node that is a JsxAttribute kind.
 *
 */
export class JsxAttributeHandler implements ASTNodeHandler<ts.SyntaxKind.JsxAttribute> {
  /**
   * Extracts string value of node.
   *
   * @param node - JsxAttribute node to extract data from.
   * @param rootNode - FileSource root node that contains the supplied node.
   * @returns Text value of node.
   */
  public getData(node: ts.Node, rootNode: ts.SourceFile): string {
    const nodeAsJsxAttribute = node as ts.JsxAttribute
    if (nodeAsJsxAttribute.initializer) {
      return getNodeHandler(nodeAsJsxAttribute.initializer.kind).getData(
        nodeAsJsxAttribute.initializer,
        rootNode
      )
    }
    // return raw data
    return new DefaultHandler().getData(node, rootNode)
  }
}
