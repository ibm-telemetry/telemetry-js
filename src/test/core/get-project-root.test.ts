/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getProjectRoot } from '../../main/core/get-project-root.js'
import { RunCommandError } from '../../main/exceptions/run-command-error.js'
import { Fixture } from '../__utils/fixture.js'
import { initLogger } from '../__utils/init-logger.js'

describe('getProjectRoot', () => {
  const logger = initLogger()

  it('correctly gets project root', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules')
    await expect(getProjectRoot(fixture.path, logger)).resolves.toMatch(process.cwd())
  })

  it('can handle edge case when root is the cwd', async () => {
    await expect(getProjectRoot(process.cwd(), logger)).resolves.toMatch(process.cwd())
  })

  it('throws error if no root exists', async () => {
    await expect(getProjectRoot('does-not-exist', logger)).rejects.toThrow(RunCommandError)
  })
})
