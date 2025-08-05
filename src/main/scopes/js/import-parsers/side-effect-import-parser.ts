/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { getWcPrefix } from '../../wc/utils/get-wc-prefix.js'
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
   * @param importPath - The path to parse.
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
      const componentName = this.getComponentName(importPath)
      const componentPrefix = getWcPrefix(importPath)

      sideEffectImports.push({
        name: componentName,
        prefix: componentPrefix,
        path: importPath,
        isDefault: false,
        isAll: false,
        isSideEffect: true
      })
    }

    return sideEffectImports
  }

  /**
   * Analyzes a file path string and returns the component name.
   *
   * - If the last segment is "index" or "index.js", returns the name of the parent directory.
   * - Otherwise, returns the file name without extension.
   *
   * @param filePath - A relative path string like './foo/index.js' or './bar.js'.
   * @returns The normalized component name, e.g., 'foo' or 'bar'.
   */
  getComponentName(filePath: string): string {
    const parts = filePath.split('/')
    const last = parts[parts.length - 1]

    // strip file extension (if any)
    const fileName = last?.replace(/\.[^/.]+$/, '')

    if (fileName === 'index' && parts.length > 1) {
      return parts[parts.length - 2] ?? '' // return parent folder name
    }

    return fileName ?? '' // return filename without extension
  }
}
