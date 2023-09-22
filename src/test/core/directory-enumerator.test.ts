/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { DirectoryEnumerator } from '../../main/core/directory-enumerator.js'
import { createLogFilePath } from '../../main/core/log/create-log-file-path.js'
import { Logger } from '../../main/core/log/logger.js'
import { InvalidRootPathError } from '../../main/exceptions/invalid-root-path-error.js'
import { hasNodeModulesFolder } from '../../main/scopes/npm/has-node-modules-folder.js'
import { Fixture } from '../__utils/fixture.js'

const logger = new Logger(await createLogFilePath(new Date().toISOString()))

describe('directoryEnumerator', () => {
  it('correctly retrieves list of directories', async () => {
    const rootFixture = new Fixture('projects/nested-node-modules-folders')
    const fixture = new Fixture('projects/nested-node-modules-folders/node_modules/nested-dep')
    const enumerator = new DirectoryEnumerator(logger)

    await expect(
      enumerator.find(fixture.path, rootFixture.path, hasNodeModulesFolder)
    ).resolves.toHaveLength(2)
  })

  it('returns empty if no valid dirs', async () => {
    const rootFixture = new Fixture('')
    const fixture = new Fixture('projects/no-node-modules-folders')
    const enumerator = new DirectoryEnumerator(logger)

    await expect(
      enumerator.find(fixture.path, rootFixture.path, hasNodeModulesFolder)
    ).resolves.toHaveLength(0)
  })

  it('throws error when cwd is not contained in the root', async () => {
    const rootFixture = new Fixture('a/b/c')
    const fixture = new Fixture('d/e/f')
    const enumerator = new DirectoryEnumerator(logger)

    await expect(
      enumerator.find(fixture.path, rootFixture.path, hasNodeModulesFolder)
    ).rejects.toThrow(InvalidRootPathError)
  })
})
