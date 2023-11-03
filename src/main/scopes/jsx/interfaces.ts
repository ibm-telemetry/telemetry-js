/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { type AstNodeHandler } from './ast-node-handler.js'
import { type ElementNodeHandler } from './element-node-handler.js'

export interface Attribute {
  name: string
  value: unknown
}

export interface JsxElement {
  name: string | undefined
  prefix: string | undefined
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

export interface FileTree {
  root: string
  children: FileTree[]
}

export interface JsxElementImportMatcher {
  isMatch: (element: PartialJsxElement, imports: JsxImportElement[]) => boolean
}

export type PartialJsxElement = Omit<JsxElement, 'importedBy'> & Partial<JsxElement>

type ElementNodeHandlerProducer = new (rootNode: ts.SourceFile) => ElementNodeHandler
export type ElementNodeHandlerMap = Partial<Record<ts.SyntaxKind, ElementNodeHandlerProducer>>

type AstNodeHandlerProducer = new (rootNode: ts.SourceFile) => AstNodeHandler
export type AstNodeHandlerMap = Partial<Record<ts.SyntaxKind, AstNodeHandlerProducer>>
