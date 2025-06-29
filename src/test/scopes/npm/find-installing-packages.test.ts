/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { NoNodeModulesFoundError } from '../../../main/exceptions/no-node-modules-found-error.js'
import { findInstallingPackages } from '../../../main/scopes/npm/find-installing-packages.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('findInstallingPackages', () => {
  const logger = initLogger()

  it('throws an error if no node modules folders were found', async () => {
    const fixture = new Fixture('projects/no-package-json-files/foo/bar')
    const root = new Fixture('projects/no-package-json-files')

    await expect(
      async () =>
        await findInstallingPackages(
          fixture.path,
          root.path,
          'not-here',
          ({ value }) => value.version === '0.1.0',
          logger
        )
    ).rejects.toThrow(NoNodeModulesFoundError)
  })

  it('correctly finds installing package data', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const root = new Fixture('projects/basic-project')
    const pkgs = await findInstallingPackages(
      fixture.path,
      root.path,
      'instrumented',
      ({ value }) => value.version === '0.1.0',
      logger
    )

    expect(pkgs).toMatchSnapshot()
  })

  it('finds no results for an unknown package', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const root = new Fixture('projects/basic-project')
    const pkgs = await findInstallingPackages(
      fixture.path,
      root.path,
      'not-here',
      ({ value }) => value.version === '0.1.0',
      logger
    )

    expect(pkgs).toMatchSnapshot()
  })

  it('finds no results for an known package at an unknown version', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const root = new Fixture('projects/basic-project')
    const pkgs = await findInstallingPackages(
      fixture.path,
      root.path,
      'instrumented',
      ({ value }) => value.version === '0.3.0',
      logger
    )

    expect(pkgs).toMatchSnapshot()
  })

  it('finds all installers when no version is specified', async () => {
    const fixture = new Fixture(
      'projects/multiple-versions-of-instrumented-dep/node_modules/instrumented'
    )
    const root = new Fixture('projects/multiple-versions-of-instrumented-dep')
    const pkgs = await findInstallingPackages(
      fixture.path,
      root.path,
      'instrumented',
      () => true,
      logger
    )

    expect(pkgs).toMatchSnapshot()
  })
})
