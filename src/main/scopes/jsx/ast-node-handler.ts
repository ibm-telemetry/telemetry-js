/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { IncorrectlyImplementedInterfaceError } from '../../exceptions/incorrectly-implemented-interface-error.js'
import { type JsxScopeAccumulator } from './jsx-scope-accumulator.js'

/**
 * Defines API to process typescript AST nodes and capture elements and imports.
 */
export abstract class ASTNodeHandler {
  protected readonly sourceNode: ts.SourceFile

  // Top-level root node containing raw text data (usually source file node).
  constructor(sourceNode: ts.SourceFile) {
    this.sourceNode = sourceNode
  }

  handle(_node: ts.Node, _accumulator: JsxScopeAccumulator) {
    throw new IncorrectlyImplementedInterfaceError('handle', 'ASTNodeHandler')
  }

  abstract getData(node: ts.Node): unknown
}
