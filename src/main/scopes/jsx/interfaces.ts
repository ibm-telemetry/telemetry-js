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
  prefix: string
  raw: string
  attributes: JsxElementAttribute[]
  pos: number
  end: number
  importedBy: string
}

export interface JsxElementAttribute {
  name: string
  value: unknown
  isVarReference: boolean
  isSpread: boolean
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

export interface ASTNodeHandler {
  handle: (node: ts.Node, accumulator: JsxScopeAccumulator) => void
}

export interface FileTree {
  root: string
  children: FileTree[]
}

export type PartialJsxElement = Omit<JsxElement, 'raw' | 'importedBy'> & Partial<JsxElement>
