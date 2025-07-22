/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import type { JsImport } from '../interfaces.js'
import { ImportParser } from './import-parser.js'

/**
 * Holds logic to construct a JsImport object given an ImportDeclaration node.
 *
 */
export class SideEffectImportParser extends ImportParser {
  /**
   * Parses side-effect-only imports like `import 'some/module'`.
   *
   * @param importNode - The full ImportDeclaration node.
   * @param importPath
   * @returns Array of JsImport.
   */
  parse(importNode: ts.ImportDeclaration, importPath: string): JsImport[] {
    const sideEffectImports: JsImport[] = []

    // Only handle side-effect-only imports
    if (
      ts.isImportDeclaration(importNode) &&
      !importNode.importClause &&
      ts.isStringLiteral(importNode.moduleSpecifier)
    ) {
      // extracts file name and builds a possible component name
      // e.g. "components/button/button.ts" -> "cds-button"
      const componentName = `cds-${importPath
        .split('/')
        .pop()
        ?.replace(/\.[^/.]+$/, '')}`

      sideEffectImports.push({
        name: componentName,
        path: importPath,
        isDefault: false,
        isAll: false,
        isSideEffect: true
      })
    }

    return sideEffectImports
  }
}
