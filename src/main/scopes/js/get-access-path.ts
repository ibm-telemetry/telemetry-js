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

/**
 * Constructs a JsToken object from a given Identifier type AST node.
 *
 * @param node - TS node to retrieve access path for.
 * @param sourceFile - Root AST node.
 * @param logger - A logger instance.
 * @param currAccessPath - For internal use only, tracks current constructed access path.
 * @param topLevel - For internal use only, tracks top level function call.
 * @returns Access path to node represented as string array (chunks).
 */
export default function getAccessPath(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  logger: Logger,
  currAccessPath: string[] = [],
  topLevel: boolean = true
): string[] {
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
      if (data instanceof ComplexValue) {
        currAccessPath = [
          ...currAccessPath,
          getAccessPath(argumentExpression, sourceFile, logger, [], false).reverse().join('.')
        ]
      } else {
        currAccessPath.push(data?.toString() ?? '')
      }
      break
    }
  }

  let accessPath = currAccessPath

  if ('expression' in node) {
    accessPath = getAccessPath(
      node.expression as ts.Node,
      sourceFile,
      logger,
      currAccessPath,
      false
    )
  }

  return topLevel ? accessPath.reverse() : accessPath
}
