/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getDirectoryPrefix } from '../../../main/scopes/npm/get-directory-prefix.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('getDirectoryPrefix', () => {
  const logger = initLogger()

  it('correctly returns directory', async () => {
    const fixture = new Fixture('projects/basic-project')
    const directory = await getDirectoryPrefix(fixture.path, logger)
    expect(directory.endsWith('src/test/__fixtures/projects/basic-project')).toBeTruthy()
  })

  it('correctly returns directory for nested directory', async () => {
    const fixture = new Fixture('projects/nested-project-files/nested/deeply-nested')
    const directory = await getDirectoryPrefix(fixture.path, logger)
    expect(directory.endsWith('telemetry-js')).toBeTruthy()
  })

  it('correctly returns directory for a workspace project', async () => {
    const fixture = new Fixture('projects/basic-monorepo/package1')

    const directory = await getDirectoryPrefix(fixture.path, logger)
    expect(directory.endsWith('src/test/__fixtures/projects/basic-monorepo/package1')).toBeTruthy()
  })
})
