/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { type Logger } from '../../core/log/logger.js'
import { type AttributeNodeHandlerMap } from './interfaces.js'
import { type AttributeNodeHandler } from './node-handlers/attributes/attribute-node-handler.js'
import { DefaultHandler } from './node-handlers/attributes/default-handler.js'
import { FalseKeywordHandler } from './node-handlers/attributes/false-keyword-handler.js'
import { JsxAttributeHandler } from './node-handlers/attributes/jsx-attribute-handler.js'
import { JsxExpressionHandler } from './node-handlers/attributes/jsx-expression-handler.js'
import { JsxSpreadAttributeHandler } from './node-handlers/attributes/jsx-spread-attribute-handler.js'
import { NullKeywordHandler } from './node-handlers/attributes/null-keyword-handler.js'
import { NumericLiteralHandler } from './node-handlers/attributes/numeric-literal-handler.js'
import { StringLiteralHandler } from './node-handlers/attributes/string-literal-handler.js'
import { TrueKeywordHandler } from './node-handlers/attributes/true-keyword-handler.js'
import { UndefinedKeywordHandler } from './node-handlers/attributes/undefined-keyword-handler.js'

/**
 * Maps node kinds to handlers that know how to extract string representations of their value.
 */
export const attributesNodeHandlerMap: AttributeNodeHandlerMap = {
  [ts.SyntaxKind.StringLiteral]: StringLiteralHandler,
  [ts.SyntaxKind.FalseKeyword]: FalseKeywordHandler,
  [ts.SyntaxKind.NullKeyword]: NullKeywordHandler,
  [ts.SyntaxKind.NumericLiteral]: NumericLiteralHandler,
  [ts.SyntaxKind.TrueKeyword]: TrueKeywordHandler,
  [ts.SyntaxKind.UndefinedKeyword]: UndefinedKeywordHandler,
  [ts.SyntaxKind.JsxExpression]: JsxExpressionHandler,
  [ts.SyntaxKind.JsxAttribute]: JsxAttributeHandler,
  [ts.SyntaxKind.JsxSpreadAttribute]: JsxSpreadAttributeHandler
}

export const getAttributeNodeHandler = (
  nodeKind: ts.SyntaxKind,
  sourceNode: ts.SourceFile,
  logger: Logger
): AttributeNodeHandler => {
  const Handler = attributesNodeHandlerMap[nodeKind] ?? DefaultHandler
  return new Handler(sourceNode, logger)
}
