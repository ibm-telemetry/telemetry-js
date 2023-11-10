/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

/**
 * Given a sourceNode, returns all nodes of a given type contained in the node's tree.
 *
 * @param sourceNode - Top-level node to start analysis from.
 * @param kind - Node kind to find nodes for.
 * @param predicate - Function to indicate whether or not each node that matches the kind
 *  should be part of the result set.
 * @returns Array of nodes that match the specified kind.
 */
export function findNodesByType(
  sourceNode: ts.SourceFile,
  kind: ts.SyntaxKind,
  predicate: (node: ts.Node) => boolean = () => true
) {
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

  return nodes
}
