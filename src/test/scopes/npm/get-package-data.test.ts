/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getPackageData } from '../../../main/scopes/npm/get-package-data.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('getPackageData', () => {
  const logger = initLogger()

  it('correctly reads name and version', async () => {
    const fixture = new Fixture('projects/basic-project')
    await expect(getPackageData(fixture.path, fixture.path, logger)).resolves.toStrictEqual({
      name: 'basic-project',
      version: '1.0.0'
    })
  })

  it('correctly reads name and version for a workspace project', async () => {
    const fixture = new Fixture('projects/basic-monorepo/package1')
    const root = new Fixture('projects/basic-monorepo')
    await expect(getPackageData(fixture.path, root.path, logger)).resolves.toStrictEqual({
      name: 'package1',
      version: '1.0.0'
    })
  })

  it('throws error for non-existent directory', async () => {
    await expect(getPackageData('/made/up/directory', '/made/up', logger)).rejects.toThrow(Error)
  })
})
