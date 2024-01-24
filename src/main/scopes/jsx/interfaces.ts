/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type Logger } from '../../core/log/logger.js'
import { PackageData } from '../npm/interfaces.js'
import { type ComplexAttribute } from './complex-attribute.js'
import { type AttributeNodeHandler } from './node-handlers/attributes/attribute-node-handler.js'
import { type ElementNodeHandler } from './node-handlers/elements/element-node-handler.js'

export interface JsxElementAttribute {
  name: string
  value: string | number | boolean | ComplexAttribute | null | undefined
}

export interface JsxImport {
  name: string
  path: string
  isDefault: boolean
  isAll: boolean
  rename?: string
}

export interface JsxElement {
  name: string
  prefix: string | undefined
  attributes: JsxElementAttribute[]
}

export interface FileTree {
  path: string
  children: FileTree[]
}

export interface JsxElementImportMatcher {
  findMatch: (element: JsxElement, imports: JsxImport[]) => JsxImport | undefined
}

type ElementNodeHandlerClass<DataType> = new (
  node: ts.SourceFile,
  logger: Logger
) => ElementNodeHandler<DataType>

export type ElementNodeHandlerMap = Partial<Record<ts.SyntaxKind, ElementNodeHandlerClass<unknown>>>

type AttributeNodeHandlerProducer = new (
  node: ts.SourceFile,
  logger: Logger
) => AttributeNodeHandler

export type AttributeNodeHandlerMap = Partial<Record<ts.SyntaxKind, AttributeNodeHandlerProducer>>

export interface DependencyTreeDependency {
  version: string
  dependencies: Record<string, DependencyTreeDependency>
}

export interface DependencyTree extends PackageData {
  name: string
  version: string
  dependencies: Record<string, DependencyTreeDependency>
  [key: string]: unknown
}
