/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ComplexValue } from '../js/complex-value.js'

export interface WcElementAttribute {
  name: string
  value: string | number | boolean | ComplexValue | null | undefined
}

export interface WcElement {
  name: string
  attributes: WcElementAttribute[]
}

/**
 * An interface for generic AST node adapters that provide
 * a unified way to traverse nodes regardless of syntax tree format.
 *
 * @template TNode The type of the original AST node being adapted.
 */
export interface INodeAdapter<TNode> {
  /**
   * Returns the kind/type of the node.
   *
   * @returns The node kind or type identifier.
   */
  getKind(): string | number

  /**
   * Lazily yields child nodes wrapped in the same adapter interface.
   *
   * @returns Iterable of child nodes.
   */
  getChildren(): Iterable<INodeAdapter<TNode>>

  /**
   * Returns the raw original AST node.
   *
   * @returns The unwrapped AST node.
   */
  getNode(): TNode
}
