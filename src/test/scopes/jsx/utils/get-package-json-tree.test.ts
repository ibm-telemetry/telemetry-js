/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import { describe, expect, it } from 'vitest'

import { getPackageJsonTree } from '../../../../main/scopes/jsx/utils/get-package-json-tree.js'
import { Fixture } from '../../../__utils/fixture.js'
import { initLogger } from '../../../__utils/init-logger.js'

describe('getPackageJsonTree', () => {
  const logger = initLogger()

  it('correctly gets a tree', async () => {
    const fixture = new Fixture('projects/complex-nesting-thingy')

    const tree = await getPackageJsonTree(fixture.path, logger)

    expect(tree).toStrictEqual([
      {
        children: [
          { children: [], path: path.join(fixture.path, 'package1') },
          {
            children: [],
            path: path.join(fixture.path, 'package2')
          },
          {
            children: [],
            path: path.join(fixture.path, 'package3')
          }
        ],
        path: path.join(fixture.path, '')
      }
    ])
  })

  it('return an empty tree for an empty directory', async () => {
    const rootFixture = new Fixture('projects/no-package-json-files')

    const tree = await getPackageJsonTree(rootFixture.path, logger)
    expect(tree).toHaveLength(0)
  })

  it('returns an empty tree with directory does not exist', async () => {
    const rootFixture = new Fixture('jsx-samples/does-not-exist')

    const tree = await getPackageJsonTree(rootFixture.path, logger)
    expect(tree).toHaveLength(0)
  })
})
