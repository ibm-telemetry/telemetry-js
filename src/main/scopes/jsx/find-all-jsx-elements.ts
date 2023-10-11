/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Node } from 'typescript'

import { JsxScopeAccumulator } from './jsx-scope-accumulator.js'
import { JsxNodeHandlerMap } from './node-handler-map.js'
import { NodeParser } from './node-parser.js'

/**
 * Given a root node (usually a source file node), finds all JSX elements and imports
 * and stores them in a Jsx accumulator.
 *
 * @param fileNode -  root AST node to start Jsx explorations from.
 * @returns JsxAccumulator instance containing imports and elements state.
 */
export function findAllJsxElements(fileNode: Node): JsxScopeAccumulator {
  const accumulator = new JsxScopeAccumulator()

  const parser = new NodeParser(accumulator, JsxNodeHandlerMap)

  parser.visit(fileNode)

  return accumulator
}