/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type ts from 'typescript'

import type { ParsedFile } from '../interfaces.js'

/**
 *
 * @param node
 */
export function isTsSourceFile(node: ParsedFile): node is ts.SourceFile {
  return (
    typeof (node as ts.SourceFile).kind === 'number' &&
    Array.isArray((node as ts.SourceFile).statements)
  )
}
