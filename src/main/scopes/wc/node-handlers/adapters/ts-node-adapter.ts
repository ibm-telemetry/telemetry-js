/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import type { INodeAdapter } from '../../interfaces.js'

/**
 * Adapter for a TypeScript AST node that implements a common interface
 * for traversing different kinds of syntax trees.
 */
export class TsNodeAdapter implements INodeAdapter<ts.Node> {
  private readonly node: ts.Node

  /**
   * Instantiates a new TSNodeAdapter.
   *
   * @param node - Node to process.
   * @param logger - Logger instance to use.
   */
  constructor(node: ts.Node) {
    this.node = node
  }

  /**
   * Returns the TypeScript SyntaxKind of the current node.
   *
   * @returns The SyntaxKind enum value of the node.
   */
  getKind() {
    return this.node.kind
  }

  /**
   * Lazily yields the direct children of this TypeScript AST node
   * as wrapped TsNodeAdapter instances.
   *
   * This avoids building intermediate arrays and enables efficient tree traversal.
   *
   * @yields {INodeAdapter<ts.Node>} A wrapped child node adapter.
   */
  *getChildren(): Iterable<INodeAdapter<ts.Node>> {
    const node = this.node
    let child: ts.Node | undefined = node.getChildAt(0)

    for (let i = 0; i < node.getChildCount(); i++) {
      child = node.getChildAt(i)
      if (child) {
        yield new TsNodeAdapter(child)
      }
    }
  }

  /**
   * Returns the raw underlying TypeScript AST node.
   *
   * @returns The original ts.Node instance.
   */
  getNode() {
    return this.node
  }
}
