/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { ASTNodeHandler } from './ast-node-handler.js'
import { type JsxScopeAccumulator } from './jsx-scope-accumulator.js'

/**
 * Defines API to process typescript AST nodes and capture elements and imports.
 *
 * @param node - Node element to process.
 * @param accumulator - Keeps the state of the collected data (by the handlers).
 */
export abstract class ElementNodeHandler extends ASTNodeHandler {
  abstract handle(node: ts.Node, accumulator: JsxScopeAccumulator): void
}
