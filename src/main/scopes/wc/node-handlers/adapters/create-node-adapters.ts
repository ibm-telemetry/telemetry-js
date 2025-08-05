/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Node as HtmlNode } from 'domhandler'
import type * as ts from 'typescript'

import type { INodeAdapter, ParsedFile } from '../../interfaces.js'
import { isHtmlDocument } from '../../utils/is-html-document.js'
import { isTsSourceFile } from '../../utils/is-ts-source-file.js'
import { HtmlNodeAdapter } from './html-node-adapter.js'
import { TsNodeAdapter } from './ts-node-adapter.js'

/**
 * Utility function to create a node adapter to given node of either type
 * ts.SourceFile or htmlparser2.Document.
 *
 * @param sourceFile - Root node of current file.
 * @returns - Node wrapper for the specified type.
 * @throws Error if there is an unsupported node file.
 */
export function createNodeAdapter(sourceFile: ParsedFile): INodeAdapter {
  if (isTsSourceFile(sourceFile)) {
    return new TsNodeAdapter(sourceFile as ts.Node)
  }

  if (isHtmlDocument(sourceFile)) {
    return new HtmlNodeAdapter(sourceFile as HtmlNode)
  }

  throw new Error('Unsupported file type')
}
