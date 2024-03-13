/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ts = require('typescript')

import { DefaultHandler } from './default-handler.js'
import { NodeValueHandler } from './node-value-handler.js'

/**
 * Holds logic to extract data from an AST node that is a Identifier kind.
 *
 */
export class IdentifierHandler extends NodeValueHandler {
  /**
   * Extracts string value of node.
   *
   * @param node - Identifier node to extract data from.
   * @returns Text value of node.
   */
  public getData(node: ts.Identifier) {
    // `undefined` is an identifier, so it has to be treated as a special case
    if (node.escapedText.toString() === 'undefined') {
      return undefined
    }

    return new DefaultHandler(this.sourceFile, this.logger).getData(node)
  }
}
