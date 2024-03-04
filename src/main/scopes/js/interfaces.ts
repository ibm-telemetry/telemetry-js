/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { Logger } from '../../core/log/logger.js'
import { ComplexValue } from './complex-value.js'
import { JsNodeHandler } from './node-handlers/js-node-handler.js'
import { NodeValueHandler } from './node-handlers/value-handlers/node-value-handler.js'

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
