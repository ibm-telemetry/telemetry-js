/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type ASTNodeHandler } from '../../interfaces.js'

/**
 * Holds logic to extract data from an AST node that is a StringLiteral kind.
 *
 */
export class StringLiteralHandler implements ASTNodeHandler<ts.SyntaxKind.StringLiteral> {
  /**
   * Extracts string value of node.
   *
   * @param node - StringLiteral node to extract data from.
   * @param _rootNode - FileSource root node that contains the supplied node.
   * @returns Text value of node.
   */
  public getData(node: ts.Node, _rootNode: ts.SourceFile): string {
    return (node as ts.StringLiteral).text
  }
}
