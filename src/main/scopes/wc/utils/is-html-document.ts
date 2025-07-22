/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Document } from 'domhandler'

import type { ParsedFile } from '../interfaces.js'

/**
 *
 * @param node
 */
export function isHtmlDocument(node: ParsedFile): node is Document {
  return typeof (node as Document).type === 'string' && Array.isArray((node as Document).children)
}
