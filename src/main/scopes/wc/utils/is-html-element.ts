/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Element, Node } from 'domhandler'

/**
 *
 * @param node
 */
export function isHtmlElement(node: Node): node is Element {
  return node.type === 'tag' || node.type === 'script' || node.type === 'style'
}
