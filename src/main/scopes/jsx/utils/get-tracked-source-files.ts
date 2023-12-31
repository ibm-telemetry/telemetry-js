/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import * as ts from 'typescript'

import { type Logger } from '../../../core/log/logger.js'
import { TrackedFileEnumerator } from '../../../core/tracked-file-enumerator.js'

/**
 * Gets all tracked source files to consider for data collection.
 *
 * @param root - Root directory in which to search for tracked source files. This is an absolute
 * path.
 * @param logger - Logger instance to use.
 * @returns An array of source file objects.
 */
export async function getTrackedSourceFiles(root: string, logger: Logger) {
  logger.traceEnter('', 'getTrackedSourceFiles', [root])

  const fileEnumerator = new TrackedFileEnumerator(logger)
  const allowedExtensions = ['.js', '.mjs', '.cjs', '.jsx', '.tsx']
  const files = []

  // If a file is passed instead of a directory, avoid the `git ls-tree` call
  if (allowedExtensions.includes(path.extname(root))) {
    files.push(root)
  } else {
    files.push(
      ...(await fileEnumerator.find(root, (file) => allowedExtensions.includes(path.extname(file))))
    )
  }

  const promises = files.map(async (file) => {
    return ts.createSourceFile(
      file,
      (await readFile(file)).toString(),
      ts.ScriptTarget.ES2021,
      /* setParentNodes */ true
    )
  })

  const results = await Promise.all(promises)

  logger.traceExit(
    '',
    'getTrackedSourceFiles',
    results.map((result) => result.fileName)
  )
  return results
}
