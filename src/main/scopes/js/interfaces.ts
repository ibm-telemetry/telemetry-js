/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import type { Logger } from '../../core/log/logger.js'
import type { ParsedFile } from '../wc/interfaces.js'
import type { ComplexValue } from './complex-value.js'
import type { JsNodeHandler } from './node-handlers/js-node-handler.js'
import type { NodeValueHandler } from './node-handlers/value-handlers/node-value-handler.js'
import type { Import } from '../../interfaces.js'

export interface JsImport extends Import {
  isDefault: boolean
  isAll: boolean
  rename?: string
  isSideEffect?: boolean
}

export type JsNodeHandlerClass<DataType = unknown, FileType extends ParsedFile = ParsedFile> = new (
  sourceFile: FileType,
  logger: Logger
) => JsNodeHandler<DataType, FileType>

// Explanation: `any` here means handlers can accept any subtype of ParsedFile
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow subtype flexibility
export type JsNodeHandlerMap = Partial<Record<ts.SyntaxKind | string, JsNodeHandlerClass<any, any>>>

export type NodeValue = string | number | boolean | ComplexValue | null | undefined

type NodeValueHandlerProducer = new (node: ts.SourceFile, logger: Logger) => NodeValueHandler

export type NodeValueHandlerMap = Partial<Record<ts.SyntaxKind, NodeValueHandlerProducer>>

export interface JsImportMatcher<Element> {
  elementType: 'jsx' | 'wc' | 'js'
  findMatch: (element: Element, imports: JsImport[]) => JsImport | undefined
}

export interface JsFunction {
  name: string
  accessPath: Array<string | ComplexValue>
  arguments: Array<string | number | boolean | ComplexValue | null | undefined>
  startPos: number
  endPos: number
}

export interface JsToken {
  name: string
  accessPath: Array<string | ComplexValue>
  startPos: number
  endPos: number
}
