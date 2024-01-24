/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import { describe, expect, it } from 'vitest'

import { getDependencyTree } from '../../../main/scopes/npm/get-dependency-tree.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('getDependencyTree', () => {
  const logger = initLogger()

  it('correctly obtains dependency tree', async () => {
    const root = new Fixture(path.join('projects', 'complex-nesting-thingy'))
    const cwd = new Fixture(
      path.join('projects', 'complex-nesting-thingy', 'node_modules', 'package1')
    )
    await expect(getDependencyTree(cwd.path, root.path, logger)).resolves.toMatchSnapshot()
  })
})
