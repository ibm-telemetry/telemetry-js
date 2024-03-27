/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

/**
 * TODO
 */
export function createSourceFileFromText(src: string) {
  return ts.createSourceFile(
    'inline-test-file.ts',
    src,
    ts.ScriptTarget.ES2021,
    /* setParentNodes */ true
  )
}