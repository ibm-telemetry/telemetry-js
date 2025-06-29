/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import type { JsNodeHandlerMap } from '../js/interfaces.js'
import { ImportNodeHandler } from '../js/node-handlers/import-node-handler.js'
import { AccessExpressionNodeHandler } from './node-handlers/tokens-and-functions-handlers/access-expression-node-handler.js'
import { CallExpressionNodeHandler } from './node-handlers/tokens-and-functions-handlers/call-expression-node-handler.js'
import { IdentifierNodeHandler } from './node-handlers/tokens-and-functions-handlers/identifier-node-handler.js'

/**
 * Maps node kinds to handlers that know how to process them to generate JsFunction and JsToken
 * metrics for the JsScope.
 */
export const jsNodeHandlerMap: JsNodeHandlerMap = {
  [ts.SyntaxKind.ImportDeclaration]: ImportNodeHandler,
  [ts.SyntaxKind.CallExpression]: CallExpressionNodeHandler,
  [ts.SyntaxKind.PropertyAccessExpression]: AccessExpressionNodeHandler,
  [ts.SyntaxKind.ElementAccessExpression]: AccessExpressionNodeHandler,
  [ts.SyntaxKind.Identifier]: IdentifierNodeHandler
}
