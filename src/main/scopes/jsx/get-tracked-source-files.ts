/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import * as ts from 'typescript'

import { type Logger } from '../../core/log/logger.js'
import { TrackedFileEnumerator } from '../../core/tracked-file-enumerator.js'

/**
 * Gets all tracked source files to consider for data collection.
 *
 * @param root - Root directory in which to search for tracked source files.
 * @param logger - Logger instance to use.
 * @returns An array of source file objects.
 */
export async function getTrackedSourceFiles(root: string, logger: Logger) {
  const fileEnumerator = new TrackedFileEnumerator(logger)
  const allowedSuffixes = ['.js', '.jsx', '.ts', '.tsx']
  const files = []

  if (allowedSuffixes.includes(path.extname(root))) {
    files.push(root)
  } else {
    files.push(
      ...(await fileEnumerator.find(root, (file) => allowedSuffixes.includes(path.extname(file))))
    )
  }

  const promises = files.map(async (file) => {
    return ts.createSourceFile(file, (await readFile(file)).toString(), ts.ScriptTarget.ES2021)
  })

  return await Promise.all(promises)
}
