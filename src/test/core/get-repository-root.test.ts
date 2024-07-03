/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getRepositoryRoot } from '../../main/core/get-repository-root.js'
import { RunCommandError } from '../../main/exceptions/run-command-error.js'
import { Fixture } from '../__utils/fixture.js'
import { initLogger } from '../__utils/init-logger.js'

describe('getRepositoryRoot', () => {
  const logger = initLogger()

  it('correctly gets repository root', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules')
    await expect(getRepositoryRoot(fixture.path, logger)).resolves.toMatch(process.cwd())
  })

  it('can handle edge case when root is the cwd', async () => {
    await expect(getRepositoryRoot(process.cwd(), logger)).resolves.toMatch(process.cwd())
  })

  it('throws error if no root exists', async () => {
    await expect(getRepositoryRoot('does-not-exist', logger)).rejects.toThrow(RunCommandError)
  })
})
