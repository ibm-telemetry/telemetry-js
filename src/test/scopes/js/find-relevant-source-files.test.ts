/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { findRelevantSourceFiles } from '../../../main/scopes/js/find-relevant-source-files.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

// only testing edge cases since this function is used pervasively across scopes
describe('findRelevantSourceFiles', () => {
  const logger = initLogger()

  it('does not throw an error when no associated instrumented package was found', async () => {
    const cwd = new Fixture('projects/basic-project/node_modules/foo')
    const root = new Fixture('projects/basic-project')

    const relevantSourceFilesPromise = findRelevantSourceFiles(
      { name: 'not-found', version: '1.2.3' },
      cwd.path,
      root.path,
      ['.js'],
      logger
    )

    await expect(relevantSourceFilesPromise).resolves.toStrictEqual([])
  })

  it('does not throw an error when empty package.json is encountered along the way', async () => {
    const cwd = new Fixture('projects/empty-package-json/node_modules/foo')
    const root = new Fixture('projects/empty-package-json')

    const relevantSourceFilesPromise = findRelevantSourceFiles(
      { name: 'instrumented', version: '0.1.0' },
      cwd.path,
      root.path,
      ['.js'],
      logger
    )

    await expect(relevantSourceFilesPromise).resolves.toHaveLength(1)
  })
})
