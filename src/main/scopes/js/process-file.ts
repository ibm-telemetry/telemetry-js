/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import type { Logger } from '../../core/log/logger.js'
import type { JsNodeHandlerMap } from './interfaces.js'
import type { JsAccumulator } from './js-accumulator.js'
import { SourceFileHandler } from './source-file-handler.js'

/**
 * Given a source file node, passes all file nodes through appropriate handlers
 * and stores data in an accumulator.
 *
 * @param accumulator - The accumulator in which to store data.
 * @param sourceFile - Root AST node to start explorations from.
 * @param jsNodeHandlerMap - Object containing mappings between
 * node types to process and their handlers.
 * @param logger - Logger instance.
 */
export function processFile(
  accumulator: JsAccumulator,
  sourceFile: ts.SourceFile,
  jsNodeHandlerMap: JsNodeHandlerMap,
  logger: Logger
) {
  logger.traceEnter('', 'processFile', [sourceFile.fileName])
  const handler = new SourceFileHandler(accumulator, jsNodeHandlerMap, logger)

  handler.handle(sourceFile, sourceFile)
  logger.traceExit('', 'processFile', undefined)
}
