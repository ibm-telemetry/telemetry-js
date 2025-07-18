import { INodeAdapter, ParsedFile } from '../../interfaces.js'
import { TsNodeAdapter } from './ts-node-adapter.js'
import { HtmlNodeAdapter } from './html-node-adapter.js'
import * as ts from 'typescript'

import { type Node as HtmlNode } from 'domhandler'
import { isTsSourceFile } from './is-ts-source-file.js'
import { isHtmlDocument } from './is-html-document.js'

export function createNodeAdapter(sourceFile: ParsedFile): INodeAdapter {
  if (isTsSourceFile(sourceFile)) {
    return new TsNodeAdapter(sourceFile as ts.Node)
  }

  if (isHtmlDocument(sourceFile)) {
    return new HtmlNodeAdapter(sourceFile as HtmlNode)
  }

  throw new Error('Unsupported file type')
}
