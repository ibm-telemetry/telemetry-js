/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { type ASTNodeHandler, type JsxImport } from '../../interfaces.js'
import { type JsxScopeAccumulator } from '../../jsx-scope-accumulator.js'
import { AllImportElementMatcher } from '../../matchers/import-elements/all-import-element-matcher.js'
import { DefaultImportElementMatcher } from '../../matchers/import-elements/default-import-element-matcher.js'
import { NamedImportElementMatcher } from '../../matchers/import-elements/named-import-element-matcher.js'
import { RenamedImportElementMatcher } from '../../matchers/import-elements/renamed-import-element-matcher.js'

/**
 * Holds logic to construct a JsxImport object given an ImportDeclaration node.
 *
 */
export class ImportNodeHandler implements ASTNodeHandler<ts.SyntaxKind.ImportDeclaration> {
  /**
   * Processes an ImportDeclaration node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated imports state.
   * @param rootNode - FileSource root node that contains the supplied node.
   */
  public handle(node: ts.Node, accumulator: JsxScopeAccumulator, rootNode: ts.Node) {
    accumulator.storeImport(this.getData(node, rootNode))
  }

  /**
   * Constructs a JsxImport object from a given ImportDeclaration type AST node.
   *
   * @param node - Node element to process.
   * @param rootNode - FileSource root node that contains the supplied node.
   * @returns Constructed JsxImport object.
   */
  getData(node: ts.Node, rootNode: ts.Node): JsxImport {
    const matchers = [
      DefaultImportElementMatcher,
      NamedImportElementMatcher,
      RenamedImportElementMatcher
    ]
    const nodeAsImport = node as ts.ImportDeclaration
    const jsxImport: JsxImport = {
      importPath: (nodeAsImport.moduleSpecifier as ts.StringLiteral).text,
      elements: []
    }
    const importClause = nodeAsImport.importClause

    if (importClause && DefaultImportElementMatcher.isMatch(importClause, rootNode)) {
      jsxImport.elements.push(DefaultImportElementMatcher.getJsxImport(importClause))
    }
    if (importClause?.namedBindings) {
      const namedBindings = importClause.namedBindings
      if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
        namedBindings.elements.forEach((element) => {
          const matcher = matchers.find((m) => m.isMatch(element, rootNode))
          if (matcher) {
            jsxImport.elements.push(matcher.getJsxImport(element))
          }
        })
      } else {
        if (AllImportElementMatcher.isMatch(namedBindings, rootNode)) {
          jsxImport.elements.push(AllImportElementMatcher.getJsxImport(namedBindings))
        }
      }
    }
    return jsxImport
  }
}
