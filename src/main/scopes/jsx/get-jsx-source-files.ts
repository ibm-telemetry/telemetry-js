/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { type Logger } from '../../core/log/logger.js'
import { findProjectFiles } from './find-project-files.js'

/**
 * Gets all Jsx relevant source files for a given git project and returns their node representation.
 *
 * @param cwd - Working directory to search files for.
 * @param logger - Logger instance.
 * @returns Source files as nodes for a given git project.
 */
export async function getJsxSourceFiles(cwd: string, logger: Logger) {
  const fileNames = await findProjectFiles(cwd, logger, ['js', 'jsx', 'ts', 'tsx'])
  const program = ts.createProgram(fileNames, {})
  return program.getSourceFiles().filter((file) => !file.isDeclarationFile)
}
