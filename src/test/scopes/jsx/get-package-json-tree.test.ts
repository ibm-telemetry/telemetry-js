/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import { describe, expect, it } from 'vitest'

import { getPackageJsonTree } from '../../../main/scopes/jsx/get-package-json-tree.js'
import { type FileTree } from '../../../main/scopes/jsx/interfaces.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('getPackageJsonTree', () => {
  const logger = initLogger()
  it('correctly gets a tree', async () => {
    const rootFixture = new Fixture('projects')
    const tree = await getPackageJsonTree(rootFixture.path, logger)

    const setRelativePaths = (tree: FileTree) => {
      tree.path = path.relative(import.meta.url, tree.path)
      tree.children.forEach((child) => {
        setRelativePaths(child)
      })
    }

    tree.forEach((fileTree) => {
      setRelativePaths(fileTree)
    })
    expect(tree).toMatchSnapshot()
  })
  it('empty directory', async () => {
    const rootFixture = new Fixture('jsx-samples')
    const tree = await getPackageJsonTree(rootFixture.path, logger)
    expect(tree).toHaveLength(0)
  })
  it('directory does not exist', async () => {
    const rootFixture = new Fixture('jsx-samples/does-not-exist')
    const tree = await getPackageJsonTree(rootFixture.path, logger)
    expect(tree).toHaveLength(0)
  })
})
