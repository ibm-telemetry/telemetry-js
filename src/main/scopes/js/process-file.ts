/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Logger } from '../../core/log/logger.js'
import type { JsNodeHandlerMap } from './interfaces.js'
import type { JsAccumulator } from './js-accumulator.js'
import { SourceFileHandler } from './source-file-handler.js'
import { safeStringify } from '../../core/log/safe-stringify.js'
import { ParsedFile } from '../wc/interfaces.js'
import { createNodeAdapter } from '../wc/node-handlers/adapters/create-node-adapters.js'

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
  sourceFile: ParsedFile,
  jsNodeHandlerMap: JsNodeHandlerMap,
  logger: Logger
) {
  logger.traceEnter('', 'processFile', [sourceFile.fileName]) // print out
  const handler = new SourceFileHandler(accumulator, jsNodeHandlerMap, logger)

  logger.debug('Processing file', safeStringify(sourceFile))
  const rootAdapter = createNodeAdapter(sourceFile)

  handler.handle(rootAdapter, sourceFile)
  logger.traceExit('', 'processFile', undefined)
}
