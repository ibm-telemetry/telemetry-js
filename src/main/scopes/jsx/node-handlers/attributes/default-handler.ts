/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { ASTNodeHandler } from '../../ast-node-handler.js'

/**
 * Holds logic to extract raw data from an AST node.
 *
 */
export class DefaultHandler extends ASTNodeHandler {
  /**
   * Extracts raw string representation of node.
   *
   * @param node - Node to extract data from.
   * @returns Text value of node.
   */
  public getData(node: ts.Node) {
    return this.sourceNode.text.substring(node.pos, node.end).trim()
  }
}
