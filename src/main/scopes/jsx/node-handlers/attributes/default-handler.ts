/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type ASTNodeHandler } from '../../interfaces.js'

/**
 * Holds logic to extract raw data from an AST node.
 *
 */
// TODOASKJOE
export class DefaultHandler implements ASTNodeHandler<any> {
  /**
   * Extracts raw string representation of node.
   *
   * @param node - Node to extract data from.
   * @param rootNode - FileSource root node that contains the supplied node.
   * @returns Text value of node.
   */
  public getData(node: ts.Node, rootNode: ts.SourceFile) {
    return rootNode.text.substring(node.pos, node.end).trim()
  }
}
