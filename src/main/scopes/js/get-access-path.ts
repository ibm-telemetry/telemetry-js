/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import type { Logger } from '../../core/log/logger.js'
import { ComplexValue } from './complex-value.js'
import { getNodeValueHandler } from './node-value-handler-map.js'

type ExpressionContainingNode =
  | ts.PropertyAccessExpression
  | ts.ElementAccessExpression
  | ts.CallExpression

/**
 * Constructs the access path to a given expression-containing node
 * (PropertyAccessExpression, ElementAccessExpression or CallExpression)
 * by reading the node's content recursively.
 *
 * @param node - TS node to retrieve access path for.
 * @param sourceFile - Root AST node.
 * @param logger - A logger instance.
 * @returns Access path to node represented as string array (chunks).
 */
export default function getAccessPath(
  node: ExpressionContainingNode,
  sourceFile: ts.SourceFile,
  logger: Logger
) {
  return computeAccessPath(node, sourceFile, [], true, logger)
}

/**
 * Constructs the access path to a given node by reading the node's content recursively.
 *
 * @param node - TS node to retrieve access path for.
 * @param sourceFile - Root AST node.
 * @param currAccessPath - For internal use only, tracks current constructed access path.
 * @param topLevel - For internal use only, tracks top level function call.
 * @param logger - A logger instance.
 * @returns Access path to node represented as string array (chunks).
 */
function computeAccessPath(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  currAccessPath: Array<string | ComplexValue>,
  topLevel: boolean,
  logger: Logger
): Array<string | ComplexValue> {
  switch (node.kind) {
    case ts.SyntaxKind.Identifier:
      return [...currAccessPath, (node as ts.Identifier).escapedText.toString()]
    case ts.SyntaxKind.PropertyAccessExpression:
      currAccessPath.push((node as ts.PropertyAccessExpression).name.escapedText.toString())
      break
    case ts.SyntaxKind.ElementAccessExpression: {
      const argumentExpression = (node as ts.ElementAccessExpression).argumentExpression
      const data = getNodeValueHandler(argumentExpression.kind, sourceFile, logger).getData(
        argumentExpression
      )
      if (data !== undefined && data !== null) {
        currAccessPath.push(data instanceof ComplexValue ? data : data.toString())
      }
      break
    }
  }

  let accessPath = currAccessPath

  if ('expression' in node) {
    accessPath = computeAccessPath(
      node.expression as ts.Node,
      sourceFile,
      currAccessPath,
      false,
      logger
    )
  }

  return topLevel ? accessPath.reverse() : accessPath
}
