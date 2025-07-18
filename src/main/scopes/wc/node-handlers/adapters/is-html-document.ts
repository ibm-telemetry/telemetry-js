import type { Document } from 'domhandler'
import { ParsedFile } from '../../interfaces.js'

export function isHtmlDocument(node: ParsedFile): node is Document {
  return typeof (node as Document).type === 'string' && Array.isArray((node as Document).children)
}
