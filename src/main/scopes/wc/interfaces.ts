/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Document as HtmlDocument, Node as HtmlNode } from 'domhandler'
import type * as ts from 'typescript'

import type { ComplexValue } from '../js/complex-value.js'

export interface WcElementAttribute {
  name: string
  value: string | number | boolean | ComplexValue | null | undefined
}

export interface WcElement {
  name: string
  attributes: WcElementAttribute[]
}

export interface CdnImport {
  name: string
  path: string
  package: string
  isLatest: boolean
}

export type HtmlParsedFile = HtmlDocument & { fileName?: string }

/**
 * A union of possible parsed file types (TS or HTML).
 */
export type ParsedFile = ts.SourceFile | HtmlParsedFile

/**
 * Represents a node from either a TypeScript or HTML AST.
 *
 * This type is used to unify AST processing across multiple source types,
 * allowing traversal and processing logic to work with both TypeScript
 * (`ts.Node`) and HTML (`htmlparser2.Node`) trees.
 */
export type AnyAstNode = ts.Node | HtmlNode

/**
 * An interface for generic AST node adapters that provide
 * a unified way to traverse nodes regardless of syntax tree format.
 *
 * @template TNode The type of the original AST node being adapted.
 */
export interface INodeAdapter<TNode = AnyAstNode> {
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
