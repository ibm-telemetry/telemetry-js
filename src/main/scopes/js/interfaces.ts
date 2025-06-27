/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import type { Logger } from '../../core/log/logger.js'
import type { ComplexValue } from './complex-value.js'
import type { JsNodeHandler } from './node-handlers/js-node-handler.js'
import type { NodeValueHandler } from './node-handlers/value-handlers/node-value-handler.js'

export interface JsImport {
  name: string
  path: string
  isDefault: boolean
  isAll: boolean
  rename?: string
}

type JsNodeHandlerClass<DataType> = new (
  node: ts.SourceFile,
  logger: Logger
) => JsNodeHandler<DataType>

export type JsNodeHandlerMap = Partial<Record<ts.SyntaxKind, JsNodeHandlerClass<unknown>>>

export type NodeValue = string | number | boolean | ComplexValue | null | undefined

type NodeValueHandlerProducer = new (node: ts.SourceFile, logger: Logger) => NodeValueHandler

export type NodeValueHandlerMap = Partial<Record<ts.SyntaxKind, NodeValueHandlerProducer>>

export interface JsImportMatcher<Element> {
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
