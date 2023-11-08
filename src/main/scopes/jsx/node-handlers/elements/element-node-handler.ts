/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { Loggable } from '../../../../core/log/loggable.js'
import { type Logger } from '../../../../core/log/logger.js'
import { type JsxElementAccumulator } from '../../jsx-element-accumulator.js'

/**
 * Defines API to process typescript AST nodes and capture elements and imports.
 *
 * @param node - Node element to process.
 * @param accumulator - Keeps the state of the collected data (by the handlers).
 */
export abstract class ElementNodeHandler<DataType> extends Loggable {
  protected readonly sourceFile: ts.SourceFile

  constructor(sourceFile: ts.SourceFile, logger: Logger) {
    super(logger)
    this.sourceFile = sourceFile
  }

  abstract handle(node: ts.Node, accumulator: JsxElementAccumulator): void

  abstract getData(node: ts.Node): DataType
}
