/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { Loggable } from '../../core/log/loggable.js'
import { type Logger } from '../../core/log/logger.js'
import { type ElementNodeHandlerMap } from './interfaces.js'
import { type JsxElementAccumulator } from './jsx-element-accumulator.js'

/**
 * Class to handle traversing through a node's children and calling appropriate handlers.
 *
 */
export class NodeParser extends Loggable {
  private readonly accumulator: JsxElementAccumulator
  private readonly nodeHandlerMap: ElementNodeHandlerMap

  /**
   * Instantiates a new NodeParser.
   *
   * @param accumulator - Keeps the state of the collected data (by the handlers).
   * @param nodeHandlerMap - Determines what handlers (instances) are called given
   * the found node types.
   * @param logger - Logger instance to use.
   */
  constructor(
    accumulator: JsxElementAccumulator,
    nodeHandlerMap: ElementNodeHandlerMap,
    logger: Logger
  ) {
    super(logger)

    this.accumulator = accumulator
    this.nodeHandlerMap = nodeHandlerMap
  }

  /**
   * Visits each children (recursively) of the supplied node and
   * calls out to the appropriate node handlers.
   *
   * @param node - Node to traverse through (usually a file node).
   * @param rootNode - Root Node of node tree.
   */
  public visit(node: ts.Node, rootNode: ts.SourceFile) {
    const Handler = this.nodeHandlerMap[node.kind]

    if (Handler !== undefined) {
      const handler = new Handler(rootNode, this.logger)
      handler.handle(node, this.accumulator)
    }

    ts.forEachChild(node, (node) => {
      this.visit(node, rootNode)
    })
  }
}
