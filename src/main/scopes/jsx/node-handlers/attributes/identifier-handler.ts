/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { AttributeNodeHandler } from './attribute-node-handler.js'

/**
 * Holds logic to extract data from an AST node that is a Identifier kind.
 *
 */
export class IdentifierHandler extends AttributeNodeHandler {
  /**
   * Extracts string value of node.
   *
   * @param node - Identifier node to extract data from.
   * @returns Text value of node.
   */
  public getData(node: ts.Identifier): string {
    return node.escapedText.toString()
  }
}
