/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import { describe, expect, it } from 'vitest'

import { getProjectRoot } from '../../main/core/get-project-root.js'
import { Fixture } from '../__utils/fixture.js'

describe('getProjectRoot', () => {
  it('correctly gets project root', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules')
    await expect(getProjectRoot(path.resolve(fixture.path))).resolves.toMatch(/.*\/telemetrics-js/)
  })

  it('throws error if no root exists', async () => {
    await expect(getProjectRoot('does-not-exist')).rejects.toThrow('ENOENT')
  })
})
