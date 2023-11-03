/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { AstNodeHandler } from '../../ast-node-handler.js'

/**
 * Holds logic to extract data from an AST node that is a NullKeyword kind.
 *
 */
export class NullKeywordHandler extends AstNodeHandler {
  /**
   * Extracts string value of node.
   *
   * @param _node - NullKeyword node to extract data from.
   * @returns Text value of node.
   */
  public getData(_node: ts.Node) {
    return String(null)
  }
}
