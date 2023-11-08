/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { AttributeNodeHandler } from './attribute-node-handler.js'

/**
 * Holds logic to extract raw data from an AST node.
 *
 */
export class DefaultHandler extends AttributeNodeHandler {
  /**
   * Extracts raw string representation of node.
   *
   * @param node - Node to extract data from.
   * @returns Text value of node.
   */
  public getData(node: ts.Node) {
    return this.sourceFile.text.substring(node.pos, node.end).trim()
  }
}
