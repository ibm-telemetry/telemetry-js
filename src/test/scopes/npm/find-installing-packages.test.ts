/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { NoNodeModulesFoundError } from '../../../main/exceptions/no-node-modules-found-error.js'
import { findInstallingPackages } from '../../../main/scopes/npm/find-installing-packages.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('findInstallingPackages', () => {
  const logger = initLogger()

  it('throws an error if no node modules folders were found', async () => {
    const fixture = new Fixture('projects/no-package-json-files/foo/bar')

    await expect(
      async () =>
        await findInstallingPackages(
          fixture.path,
          path.join(fixture.path, '..', '..'),
          { name: 'not-here', version: '0.1.0' },
          logger
        )
    ).rejects.toThrow(NoNodeModulesFoundError)
  })

  it('correctly finds installing package data', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(
      fixture.path,
      path.join(fixture.path, '..', '..'),
      { name: 'instrumented', version: '0.1.0' },
      logger
    )

    expect(pkgs).toMatchSnapshot()
  })

  it('finds no results for an unknown package', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(
      fixture.path,
      path.join(fixture.path, '..', '..'),
      { name: 'not-here', version: '0.1.0' },
      logger
    )

    expect(pkgs).toMatchSnapshot()
  })

  it('finds no results for an known package at an unknown version', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(
      fixture.path,
      path.join(fixture.path, '..', '..'),
      { name: 'instrumented', version: '0.3.0' },
      logger
    )

    expect(pkgs).toMatchSnapshot()
  })
})
