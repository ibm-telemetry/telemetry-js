/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { readFile } from 'node:fs/promises'
import * as path from 'node:path'

import * as ts from 'typescript'

import { type Logger } from './log/logger.js'
import { TrackedFileEnumerator } from './tracked-file-enumerator.js'
import { parseDocument } from 'htmlparser2'
import type { Document as HtmlDocument } from 'domhandler'
import { HtmlParsedFile } from '../scopes/wc/interfaces.js'

/**
 * Gets all tracked source files to consider for data collection,
 * filtered by supplied file extension array.
 *
 * @param cwd - Working directory for underlying command execution.
 * @param root - Root directory in which to search for tracked source files. This is an absolute
 * path.
 * @param logger - Logger instance to use.
 * @param fileExtensions - List of file extensions to filter files by.
 * @returns An array of source file objects.
 */
export async function getTrackedSourceFiles(
  cwd: string,
  root: string,
  logger: Logger,
  fileExtensions: string[]
) {
  logger.traceEnter('', 'getTrackedSourceFiles', [root, fileExtensions])

  const fileEnumerator = new TrackedFileEnumerator(logger)
  const files = []

  // If a file is passed instead of a directory, avoid the `git ls-tree` call
  if (fileExtensions.includes(path.extname(root))) {
    files.push(root)
  } else {
    files.push(
      ...(await fileEnumerator.find(cwd, root, (file) =>
        fileExtensions.includes(path.extname(file))
      ))
    )
  }

  const promises = files.map(async (file) => {
    return {
      fileName: file,
      async createSourceFile(): Promise<ts.SourceFile | HtmlDocument> {
        // Parse html file with `htmlparser2
        if (file.endsWith('html') || file.endsWith('htm')) {
          const parsedFile = parseDocument((await readFile(file)).toString()) as HtmlParsedFile
          parsedFile.fileName = file
        }

        // Parse any other files
        return ts.createSourceFile(
          file,
          (await readFile(file)).toString(),
          ts.ScriptTarget.ES2021,
          /* setParentNodes */ true
        )
      }
    }
  })

  const results = await Promise.all(promises)

  logger.traceExit(
    '',
    'getTrackedSourceFiles',
    results.map((result) => result.fileName)
  )
  return results
}
