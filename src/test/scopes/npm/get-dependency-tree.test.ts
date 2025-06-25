/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getDependencyTree } from '../../../main/scopes/npm/get-dependency-tree.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('getDependencyTree', () => {
  const logger = initLogger()

  it('correctly obtains dependency tree', async () => {
    const root = new Fixture('projects/basic-monorepo')
    const cwd = new Fixture('projects/basic-monorepo/node_modules/package1')
    await expect(getDependencyTree(cwd.path, root.path, logger)).resolves.toMatchSnapshot()
  })

  it('correctly obtains dependency tree for nested dep', async () => {
    const root = new Fixture('projects/hoisted-deeply-nested-deps')
    const cwd = new Fixture('projects/hoisted-deeply-nested-deps/node_modules/intermediate')
    await expect(getDependencyTree(cwd.path, root.path, logger)).resolves.toMatchSnapshot()
  })
})
