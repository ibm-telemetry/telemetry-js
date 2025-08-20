/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { hasNodeModulesFolder } from '../../../main/scopes/npm/has-node-modules-folder.js'
import { Fixture } from '../../__utils/fixture.js'

describe('hasNodeModulesFolder', () => {
  it('returns true if node_modules exist', async () => {
    const fixture = new Fixture('projects/basic-project')
    await expect(hasNodeModulesFolder(fixture.path)).resolves.toBeTruthy()
  })

  it('returns false if node_modules does not exist', async () => {
    const fixture = new Fixture('projects/no-node-modules-folders')
    await expect(hasNodeModulesFolder(fixture.path)).resolves.toBeFalsy()
  })
})
