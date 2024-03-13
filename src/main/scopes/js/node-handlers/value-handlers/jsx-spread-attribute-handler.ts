/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { ComplexValue } from '../../complex-value.js'
import { NodeValueHandler } from './node-value-handler.js'

/**
 * Holds logic to extract data from an AST node that is a JsxSpreadAttribute kind.
 *
 */
export class JsxSpreadAttributeHandler extends NodeValueHandler {
  /**
   * Extracts string value of node.
   *
   * @param node - JsxAttribute node to extract data from.
   * @returns Text value of node.
   */
  public getData(node: ts.JsxSpreadAttribute) {
    return new ComplexValue(node.getText(this.sourceFile))
  }
}
