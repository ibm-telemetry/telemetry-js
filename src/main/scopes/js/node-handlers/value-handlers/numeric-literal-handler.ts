/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ts = require('typescript')

import { NodeValueHandler } from './node-value-handler.js'

/**
 * Holds logic to extract data from an AST node that is a NumericLiteral kind.
 *
 */
export class NumericLiteralHandler extends NodeValueHandler {
  /**
   * Extracts string value of node.
   *
   * @param node - NumericLiteral node to extract data from.
   * @returns Text value of node.
   */
  public getData(node: ts.NumericLiteral) {
    return Number(node.text)
  }
}
