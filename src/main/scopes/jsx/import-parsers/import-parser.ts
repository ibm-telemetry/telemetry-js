/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { type JsImport } from '../interfaces.js'

/**
 * Defines API to construct JsxImportElements from ImportClause nodes.
 */
export abstract class ImportParser {
  abstract parse(importNode: ts.ImportClause, importPath: string): JsImport[]
}
