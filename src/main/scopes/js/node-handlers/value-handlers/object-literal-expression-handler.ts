/*
 * Copyright IBM Corp. 2026, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { ComplexValue } from '../../complex-value.js'
import type { NodeValue } from '../../interfaces.js'
import { getNodeValueHandler } from '../../node-value-handler-map.js'
import { NodeValueHandler } from './node-value-handler.js'

/**
 * Holds logic to extract data from an AST node that is an ObjectLiteralExpression kind.
 * Parses each property into a `Record<string, NodeValue>` stored inside a `ComplexValue`,
 * so downstream consumers can inspect individual sub-keys.
 */
export class ObjectLiteralExpressionHandler extends NodeValueHandler {
  /**
   * Extracts a key/value map from an ObjectLiteralExpression node.
   * Only properties with a simple identifier or string-literal key are included.
   * Properties with computed keys, spread elements, or method shorthand are omitted.
   *
   * @param node - ObjectLiteralExpression node to extract data from.
   * @returns A `ComplexValue` wrapping a `Record<string, NodeValue>`.
   */
  public getData(node: ts.ObjectLiteralExpression): ComplexValue {
    const result: Record<string, NodeValue> = {}

    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) {
        continue
      }

      const keyNode = property.name
      let key: string | undefined

      if (ts.isIdentifier(keyNode)) {
        key = keyNode.text
      } else if (ts.isStringLiteral(keyNode)) {
        key = keyNode.text
      }

      if (key === undefined) {
        continue
      }

      result[key] = getNodeValueHandler(
        property.initializer.kind,
        this.sourceFile,
        this.logger
      ).getData(property.initializer)
    }

    return new ComplexValue(result)
  }
}
