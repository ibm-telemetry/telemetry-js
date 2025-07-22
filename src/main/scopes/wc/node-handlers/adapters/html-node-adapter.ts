/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Node as HtmlNode } from 'domhandler'
import { isTag } from 'domutils'

import type { INodeAdapter } from '../../interfaces.js'

/**
 * Adapter for HTML AST nodes from `htmlparser2`, implementing an interface
 * for traversing syntax trees.
 */
export class HtmlNodeAdapter implements INodeAdapter<HtmlNode> {
  private readonly node: HtmlNode

  /**
   * Instantiates a new TSNodeAdapter.
   *
   * @param node - Node to process.
   * @param logger - Logger instance to use.
   */
  constructor(node: HtmlNode) {
    this.node = node
  }

  /**
   * Returns the type of the current HTML node (e.g. 'tag', 'text', 'comment').
   * If it's a tag, it returns `'HtmlElement'` for consistency with handler maps.
   *
   * @returns A string representing the node type or special identifier for tags.
   */
  getKind(): string {
    if (this.node.type === 'script') {
      return 'HtmlScript'
    }
    if (this.node.type === 'tag') {
      return 'HtmlElement'
    }
    return this.node.type
  }

  /**
   * Lazily yields child nodes wrapped as `HtmlNodeAdapter` instances.
   * This method skips text or comment nodes if needed at the call site.
   *
   * @yields A wrapped child node adapter.
   */
  *getChildren(): Iterable<INodeAdapter<HtmlNode>> {
    if ('children' in this.node && Array.isArray(this.node.children)) {
      for (const child of this.node.children) {
        yield new HtmlNodeAdapter(child)
      }
    }
  }

  /**
   * Returns the raw HTML node as provided by `htmlparser2`.
   *
   * @returns The original htmlparser2 node.
   */
  getNode(): HtmlNode {
    return this.node
  }

  /**
   * Returns the name of the current node.
   *
   * @returns The node's tag name.
   */
  getTagName(): string | undefined {
    if (isTag(this.node)) {
      return this.node.name
    }
    return undefined
  }

  /**
   * Returns the node's attributes.
   *
   * @returns The node's attributes.
   */
  getAttributes(): Record<string, string> | undefined {
    if (isTag(this.node)) {
      return this.node.attribs
    }
    return undefined
  }
}
