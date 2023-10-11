/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { ImportNodeHandler } from './node-handlers/import-node-handler.js'
import { JsxElementNodeHandler } from './node-handlers/jsx-element-node-handler.js'
// Maps node kinds to handlers that know how to process them
// to generate JsxElement metrics for the JsxScope
export const JsxNodeHandlerMap = {
  [ts.SyntaxKind.ImportDeclaration]: new ImportNodeHandler(),
  [ts.SyntaxKind.JsxElement]: new JsxElementNodeHandler()
}
