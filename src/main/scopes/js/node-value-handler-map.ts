/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ts = require('typescript')

import { type Logger } from '../../core/log/logger.js'
import { NodeValueHandlerMap } from './interfaces.js'
import { DefaultHandler } from './node-handlers/value-handlers/default-handler.js'
import { FalseKeywordHandler } from './node-handlers/value-handlers/false-keyword-handler.js'
import { IdentifierHandler } from './node-handlers/value-handlers/identifier-handler.js'
import { JsxAttributeHandler } from './node-handlers/value-handlers/jsx-attribute-handler.js'
import { JsxExpressionHandler } from './node-handlers/value-handlers/jsx-expression-handler.js'
import { JsxSpreadAttributeHandler } from './node-handlers/value-handlers/jsx-spread-attribute-handler.js'
import { type NodeValueHandler } from './node-handlers/value-handlers/node-value-handler.js'
import { NullKeywordHandler } from './node-handlers/value-handlers/null-keyword-handler.js'
import { NumericLiteralHandler } from './node-handlers/value-handlers/numeric-literal-handler.js'
import { StringLiteralHandler } from './node-handlers/value-handlers/string-literal-handler.js'
import { TrueKeywordHandler } from './node-handlers/value-handlers/true-keyword-handler.js'

/**
 * Maps node kinds to handlers that know how to extract string representations of their value.
 */
export const nodeValueHandlersMap: NodeValueHandlerMap = {
  [ts.SyntaxKind.StringLiteral]: StringLiteralHandler,
  [ts.SyntaxKind.FalseKeyword]: FalseKeywordHandler,
  [ts.SyntaxKind.NullKeyword]: NullKeywordHandler,
  [ts.SyntaxKind.NumericLiteral]: NumericLiteralHandler,
  [ts.SyntaxKind.TrueKeyword]: TrueKeywordHandler,
  [ts.SyntaxKind.JsxExpression]: JsxExpressionHandler,
  [ts.SyntaxKind.JsxAttribute]: JsxAttributeHandler,
  [ts.SyntaxKind.JsxSpreadAttribute]: JsxSpreadAttributeHandler,
  [ts.SyntaxKind.Identifier]: IdentifierHandler
}

export const getNodeValueHandler = (
  nodeKind: ts.SyntaxKind,
  sourceNode: ts.SourceFile,
  logger: Logger
): NodeValueHandler => {
  const Handler = nodeValueHandlersMap[nodeKind] ?? DefaultHandler
  return new Handler(sourceNode, logger)
}
