/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { JsxScopeAccumulator } from './jsx-scope-accumulator.js'
import { NodeParser } from './node-parser.js'

/**
 * Given a root node (usually a source file node), finds all JSX elements and imports
 * and stores them in a Jsx accumulator.
 *
 * @param fileNode -  root AST node to start Jsx explorations from.
 * @param JsxNodeHandlerMap - Determines what handlers (instances) are called given
 * the found node types.
 * @returns JsxAccumulator instance containing imports and elements state.
 */
// TODOASKJOE
export function findAllJsxElements(
  fileNode: ts.SourceFile,
  JsxNodeHandlerMap: any
): JsxScopeAccumulator {
  const accumulator = new JsxScopeAccumulator()

  const parser = new NodeParser(accumulator, JsxNodeHandlerMap)

  parser.visit(fileNode, fileNode)

  return accumulator
}
