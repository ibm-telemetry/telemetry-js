/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { type JsxScopeAccumulator } from './jsx-scope-accumulator.js'

export interface Attribute {
  name: string
  value: unknown
}

export interface JsxElement {
  name: string
  prefix?: string
  raw: string
  attributes: JsxElementAttribute[]
  importedBy: string
  importPath: string
}

export interface JsxElementAttribute {
  name: string | undefined
  value: unknown
}

export interface JsxImport {
  importPath: string
  elements: JsxImportElement[]
}

export interface JsxImportElement {
  name: string
  isDefault: boolean
  rename?: string
  isAll: boolean
}

export interface ASTNodeHandler<T extends ts.SyntaxKind> {
  handle?: (
    node: ts.Node & { kind: T },
    accumulator: JsxScopeAccumulator,
    rootNode: ts.SourceFile
  ) => void
  getData: (node: ts.Node & { kind: T }, rootNode: ts.SourceFile) => any
}

export interface FileTree {
  root: string
  children: FileTree[]
}

export interface Matcher<T> {
  // TODOASKJOE
  isMatch: (element: T, extraData: Record<string, any>) => boolean
}

export interface JsxImportMatcher<T> extends Matcher<T> {
  getJsxImport: (element: T) => JsxImportElement
}

export type PartialJsxElement = Omit<JsxElement, 'importedBy'> & Partial<JsxElement>
