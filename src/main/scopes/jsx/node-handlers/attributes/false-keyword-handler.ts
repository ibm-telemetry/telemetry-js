/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type ASTNodeHandler } from '../../interfaces.js'

/**
 * Holds logic to extract data from an AST node that is a FalseKeyword kind.
 *
 */
export class FalseKeywordHandler implements ASTNodeHandler<ts.SyntaxKind.FalseKeyword> {
  /**
   * Extracts string value of node.
   *
   * @param _node - FalseKeyword node to extract data from.
   * @param _rootNode - FileSource root node that contains the supplied node.
   * @returns Text value of node.
   */
  public getData(_node: ts.Node, _rootNode: ts.SourceFile) {
    return String(false)
  }
}
