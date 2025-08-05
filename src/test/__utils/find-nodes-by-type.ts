/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Node as HtmlNode } from 'domhandler'
import * as ts from 'typescript'

import type { HtmlNodeAdapter } from '../../main/scopes/wc/node-handlers/adapters/html-node-adapter.js'

/**
 * Given a sourceNode, returns all nodes of a given type contained in the node's tree.
 *
 * @param sourceNode - Top-level node to start analysis from.
 * @param kind - Node kind to find nodes for.
 * @param predicate - Function to indicate whether or not each node that matches the kind
 *  should be part of the result set.
 * @returns Array of nodes that match the specified kind.
 */
export function findNodesByType<T = ts.Node>(
  sourceNode: ts.SourceFile,
  kind: ts.SyntaxKind,
  predicate: (node: ts.Node) => boolean = () => true
): T[] {
  const nodes: ts.Node[] = []

  function visit(node: ts.Node) {
    if (node.kind === kind && predicate(node)) {
      nodes.push(node)
    }

    ts.forEachChild(node, (node) => {
      visit(node)
    })
  }

  visit(sourceNode)

  return nodes as T[]
}

/**
 * Given a HtmlNodeAdapter, returns all nodes of a given type contained in the node's tree.
 *
 * @param root - Top-level node to start analysis from.
 * @param kind - Node kind to find nodes for.
 * @returns Array of nodes that match the specified kind.
 */
export function findDomNodesByType(root: HtmlNodeAdapter, kind: string): HtmlNode[] {
  const results: HtmlNode[] = []

  function visit(node: HtmlNodeAdapter) {
    if (node.getKind() === kind) {
      results.push(node.getNode())
    }

    for (const child of node.getChildren()) {
      visit(child as HtmlNodeAdapter)
    }
  }

  visit(root)
  return results
}
