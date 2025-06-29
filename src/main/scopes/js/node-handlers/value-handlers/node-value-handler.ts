/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { Loggable } from '../../../../core/log/loggable.js'
import { type Logger } from '../../../../core/log/logger.js'
import type { NodeValue } from '../../interfaces.js'

/**
 * Defines API to process typescript AST nodes and capture elements and imports.
 */
export abstract class NodeValueHandler extends Loggable {
  protected readonly sourceFile: ts.SourceFile

  // Top-level root node containing raw text data (usually source file node).
  constructor(sourceFile: ts.SourceFile, logger: Logger) {
    super(logger)
    this.sourceFile = sourceFile
  }

  abstract getData(node: ts.Node): NodeValue
}
