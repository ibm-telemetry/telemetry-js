/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import type { JsImport } from '../interfaces.js'

/**
 * Defines API to construct JsImports from ImportClause nodes.
 */
export abstract class ImportParser {
  abstract parse(importNode: ts.ImportClause | ts.ImportDeclaration, importPath: string): JsImport[]
}
