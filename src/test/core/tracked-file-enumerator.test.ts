/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as path from 'node:path'

import { describe, expect, it } from 'vitest'

import { getProjectRoot } from '../../main/core/get-project-root.js'
import { TrackedFileEnumerator } from '../../main/core/tracked-file-enumerator.js'
import { Fixture } from '../__utils/fixture.js'
import { initLogger } from '../__utils/init-logger.js'

describe('class: TrackedFileEnumerator', () => {
  const logger = initLogger()
  const enumerator = new TrackedFileEnumerator(logger)

  it('correctly returns all tracked files for a predicate that always returns true', async () => {
    const root = new Fixture('projects/nested-project-files')

    await expect(enumerator.find(root.path, root.path, () => true)).resolves.toHaveLength(9)
  })

  it('correctly excludes files not matched by predicate', async () => {
    const root = new Fixture('projects/nested-project-files')

    await expect(
      enumerator.find(root.path, root.path, (fileName) => !fileName.endsWith('.something'))
    ).resolves.toHaveLength(5)
  })

  it('returns empty array when no files match predicate', async () => {
    const root = new Fixture('projects/nested-project-files')

    await expect(
      enumerator.find(root.path, root.path, (fileName) => fileName === 'does-not-exist')
    ).resolves.toHaveLength(0)
  })

  it('returns correctly resolved absolute paths', async () => {
    const root = new Fixture('projects/nested-project-files')

    const files = await enumerator.find(root.path, root.path, (fileName) =>
      fileName.endsWith('.js')
    )

    expect(files).toStrictEqual([
      path.join(root.path, 'nested-project-files/test.js'),
      path.join(root.path, 'nested/deeply-nested/test.js'),
      path.join(root.path, 'nested/test.js'),
      path.join(root.path, 'project-files/test.js'),
      path.join(root.path, 'test.js')
    ])
  })

  it('handles a top-level file in the repo', async () => {
    const root = await getProjectRoot(process.cwd(), logger)
    const fileEnumerator = new TrackedFileEnumerator(logger)
    const files = await fileEnumerator.find(root, root, (file) => file === 'package.json')

    expect(files).toStrictEqual([path.join(root, 'package.json')])
  })
})
