/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { InvalidRootPathError } from '../../../main/exceptions/invalid-root-path-error.js'
import { findScannableDirectories } from '../../../main/scopes/npm/find-scannable-directories.js'
import { Fixture } from '../../__utils/fixture.js'

describe('findScannableDirectories', () => {
  it('correctly retrieves list of directories', async () => {
    const rootFixture = new Fixture('projects/nested-node-modules-folders')
    const fixture = new Fixture('projects/nested-node-modules-folders/node_modules/nested-dep')

    await expect(findScannableDirectories(fixture.path, rootFixture.path)).resolves.toHaveLength(2)
  })
  it('returns empty if no valid dirs', async () => {
    const rootFixture = new Fixture('')
    const fixture = new Fixture('projects/no-node-modules-folders')
    await expect(findScannableDirectories(fixture.path, rootFixture.path)).resolves.toHaveLength(0)
  })
  it('throws error when cwd is not contained in the root', async () => {
    const rootFixture = new Fixture('a/b/c')
    const fixture = new Fixture('d/e/f')
    await expect(findScannableDirectories(fixture.path, rootFixture.path)).rejects.toThrow(
      InvalidRootPathError
    )
  })
})
