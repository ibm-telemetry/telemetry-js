/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import { describe, expect, it } from 'vitest'

import { TrackedFileEnumerator } from '../../../main/core/tracked-file-enumerator.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('class: TrackedFileEnumerator', () => {
  const logger = initLogger()
  const enumerator = new TrackedFileEnumerator(logger)

  it('correctly returns all tracked files for a predicate that always returns true', async () => {
    const root = new Fixture('projects/nested-project-files')

    await expect(enumerator.find(root.path, () => true)).resolves.toHaveLength(13)
  })

  it('correctly excludes files not matched by predicate', async () => {
    const root = new Fixture('projects/nested-project-files')

    await expect(
      enumerator.find(root.path, (fileName) => !fileName.endsWith('.something'))
    ).resolves.toHaveLength(8)
  })

  it('returns empty array when no files match predicate', async () => {
    const root = new Fixture('projects/nested-project-files')

    await expect(
      enumerator.find(root.path, (fileName) => fileName === 'does-not-exist')
    ).resolves.toHaveLength(0)
  })

  it('returns correctly resolved absolute paths', async () => {
    const root = new Fixture('projects/nested-project-files')

    const files = await enumerator.find(root.path, (fileName) => fileName.endsWith('.js'))

    expect(files).toStrictEqual([
      path.join(root.path, 'nested/deeply-nested/test.js'),
      path.join(root.path, 'nested/test.js'),
      path.join(root.path, 'test.js')
    ])
  })
})
