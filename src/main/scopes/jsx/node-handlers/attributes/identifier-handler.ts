/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type ASTNodeHandler } from '../../interfaces.js'

/**
 * Holds logic to extract data from an AST node that is a Identifier kind.
 *
 */
export class IdentifierHandler implements ASTNodeHandler<ts.SyntaxKind.Identifier> {
  /**
   * Extracts string value of node.
   *
   * @param node - Identifier node to extract data from.
   * @param _rootNode - FileSource root node that contains the supplied node.
   * @returns Text value of node.
   */
  public getData(node: ts.Node, _rootNode: ts.SourceFile): string {
    // TODOASKJOE
    return (node as ts.Identifier).escapedText as string
  }
}
