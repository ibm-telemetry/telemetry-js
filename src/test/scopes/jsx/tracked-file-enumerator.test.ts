/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { TrackedFileEnumerator } from '../../../main/core/tracked-file-enumerator.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('class: TrackedFileEnumerator', () => {
  const logger = initLogger()
  const enumerator = new TrackedFileEnumerator(logger)
  it('correctly returns all tracked files for a predicate that always returns true', async () => {
    const fixture = new Fixture('tracked-file-enumerator')

    await expect(enumerator.find(fixture.path, () => true)).resolves.toHaveLength(5)
  })
  it('correctly excludes files not matched by predicate', async () => {
    const fixture = new Fixture('tracked-file-enumerator')

    await expect(
      enumerator.find(fixture.path, (fileName) => !fileName.endsWith('.ble'))
    ).resolves.toHaveLength(4)
  })
  it('returns empty array when no files match predicate', async () => {
    const fixture = new Fixture('tracked-file-enumerator')

    await expect(
      enumerator.find(fixture.path, (fileName) => fileName === 'does-not-exist')
    ).resolves.toHaveLength(0)
  })
  it('returns empty array for no files', async () => {
    const fixture = new Fixture('tracked-file-enumerator/does-not-exist')

    await expect(
      enumerator.find(fixture.path, (fileName) => !fileName.endsWith('.ble'))
    ).resolves.toHaveLength(0)
  })
})
