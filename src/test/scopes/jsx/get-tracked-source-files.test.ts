/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../main/scopes/jsx/get-tracked-source-files.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('getTrackedSourceFiles', () => {
  const logger = initLogger()
  it('correctly returns all tracked files that match the desired extensions', async () => {
    const fixture = new Fixture('scopes/jsx/get-tracked-source-files')

    const fileNodes = await getTrackedSourceFiles(fixture.path, logger)

    expect(fileNodes.map((file) => file.fileName)).toStrictEqual([
      'src/test/__fixtures/scopes/jsx/get-tracked-source-files/nested/test.js',
      'src/test/__fixtures/scopes/jsx/get-tracked-source-files/test.js',
      'src/test/__fixtures/scopes/jsx/get-tracked-source-files/test.jsx',
      'src/test/__fixtures/scopes/jsx/get-tracked-source-files/test.ts',
      'src/test/__fixtures/scopes/jsx/get-tracked-source-files/test.tsx'
    ])
  })
  it('correctly includes root', async () => {
    const fixture = new Fixture('scopes/jsx/get-tracked-source-files/test.js')

    const fileNodes = await getTrackedSourceFiles(fixture.path, logger)

    expect(fileNodes.map((file) => file.fileName)).toStrictEqual([
      'src/test/__fixtures/scopes/jsx/get-tracked-source-files/test.js'
    ])
  })
  it('correctly returns empty tracked files array when no files match the desired extensions', async () => {
    const fixture = new Fixture('scopes/jsx/get-tracked-source-files/nested/deeply-nested')

    const fileNodes = await getTrackedSourceFiles(fixture.path, logger)

    expect(fileNodes.map((file) => file.fileName)).toStrictEqual([])
  })
  it('correctly returns empty tracked files array when directory does not exist', async () => {
    const fixture = new Fixture('scopes/jsx/get-tracked-source-files/does-not-exist')

    const fileNodes = await getTrackedSourceFiles(fixture.path, logger)

    expect(fileNodes.map((file) => file.fileName)).toStrictEqual([])
  })
})
