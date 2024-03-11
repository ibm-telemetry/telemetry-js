/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../main/core/get-tracked-source-files.js'
import { Fixture } from '../__utils/fixture.js'
import { initLogger } from '../__utils/init-logger.js'

describe('getTrackedSourceFiles', () => {
  const logger = initLogger()

  it('correctly returns all tracked source files', async () => {
    const root = new Fixture('projects/all-extensions')

    const sourceFiles = await getTrackedSourceFiles(root.path, logger, [
      '.js',
      '.mjs',
      '.cjs',
      '.jsx',
      '.tsx'
    ])

    expect(sourceFiles.map((file) => file.fileName)).toStrictEqual([
      path.join(root.path, 'test.cjs'),
      path.join(root.path, 'test.js'),
      path.join(root.path, 'test.jsx'),
      path.join(root.path, 'test.mjs'),
      path.join(root.path, 'test.tsx')
    ])
  })

  it('correctly includes root', async () => {
    const root = new Fixture('projects/all-extensions/test.js')

    const sourceFiles = await getTrackedSourceFiles(root.path, logger, [
      '.js',
      '.mjs',
      '.cjs',
      '.jsx',
      '.tsx'
    ])

    expect(sourceFiles.map((file) => file.fileName)).toStrictEqual([root.path])
  })

  it('correctly returns empty tracked files array when no files match the desired extensions', async () => {
    const root = new Fixture('projects/all-extensions/nested/deeply-nested/irrelevant-nested-files')

    const sourceFiles = await getTrackedSourceFiles(root.path, logger, [
      '.js',
      '.mjs',
      '.cjs',
      '.jsx',
      '.tsx'
    ])

    expect(sourceFiles.map((file) => file.fileName)).toStrictEqual([])
  })

  it('correctly returns empty tracked files array when directory does not exist', async () => {
    const root = new Fixture('scopes/jsx/not-a-real-directory')

    const sourceFiles = await getTrackedSourceFiles(root.path, logger, [
      '.js',
      '.mjs',
      '.cjs',
      '.jsx',
      '.tsx'
    ])

    expect(sourceFiles.map((file) => file.fileName)).toStrictEqual([])
  })
})
