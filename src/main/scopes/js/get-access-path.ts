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

// TODO: docs
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
    case ts.SyntaxKind.ElementAccessExpression:
      const argumentExpression = (node as ts.ElementAccessExpression).argumentExpression
      const data = getNodeValueHandler(argumentExpression.kind, sourceFile, logger).getData(
        argumentExpression
      )
      if (data instanceof ComplexValue) {
        currAccessPath = [
          ...currAccessPath,
          ...getAccessPath(
            argumentExpression as ts.PropertyAccessExpression | ts.ElementAccessExpression,
            sourceFile,
            logger,
            [],
            false
          )
        ]
      } else {
        currAccessPath.push(data?.toString() ?? '')
      }
      break
  }

  let accessPath = currAccessPath

  if ('expression' in node) {
    accessPath = getAccessPath(
      node.expression as ts.PropertyAccessExpression | ts.ElementAccessExpression,
      sourceFile,
      logger,
      currAccessPath,
      false
    )
  }

  return topLevel ? accessPath.reverse() : accessPath
}
