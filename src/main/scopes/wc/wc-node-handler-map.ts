/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import type { JsNodeHandlerMap } from '../js/interfaces.js'
import { ImportNodeHandler } from '../js/node-handlers/import-node-handler.js'
import { JsxElementNodeHandler } from '../jsx/node-handlers/elements/jsx-element-node-handler.js'
import { JsxSelfClosingElementNodeHandler } from '../jsx/node-handlers/elements/jsx-self-closing-element-node-handler.js'
import { WcElementNodeHandler } from './node-handlers/elements/wc-element-node-handler.js'
import { WcScriptNodeHandler } from './node-handlers/elements/wc-script-node-handler.js'
//
/**
 * Maps node kinds to handlers that know how to process them to generate WcElement metrics for the
 * WcScope.
 */
export const wcNodeHandlerMap: JsNodeHandlerMap = {
  [ts.SyntaxKind.ImportDeclaration]: ImportNodeHandler,
  [ts.SyntaxKind.JsxElement]: JsxElementNodeHandler,
  [ts.SyntaxKind.JsxSelfClosingElement]: JsxSelfClosingElementNodeHandler,
  ['HtmlElement']: WcElementNodeHandler,
  ['HtmlScript']: WcScriptNodeHandler
}
