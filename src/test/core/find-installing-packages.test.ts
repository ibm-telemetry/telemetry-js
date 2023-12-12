/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import { describe, expect, it } from 'vitest'

import { findInstallingPackages } from '../../main/core/find-installing-packages.js'
import { NoPackageJsonFoundError } from '../../main/exceptions/no-package-json-found-error.js'
import { Fixture } from '../__utils/fixture.js'
import { initLogger } from '../__utils/init-logger.js'

describe('findInstallingPackages', () => {
  const logger = initLogger()
  it('throws an error if no package.json files were found', async () => {
    const fixture = new Fixture('projects/no-package-json-files/foo/bar')

    await expect(
      async () =>
        await findInstallingPackages(
          fixture.path,
          path.join(fixture.path, '..', '..'),
          logger,
          'not-here',
          '0.1.0'
        )
    ).rejects.toThrow(NoPackageJsonFoundError)
  })

  it('correctly finds installing package data', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(
      fixture.path,
      path.join(fixture.path, '..', '..'),
      logger,
      'instrumented',
      '0.1.0'
    )

    expect(pkgs).toMatchSnapshot()
  })

  it('finds no results for an unknown package', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(
      fixture.path,
      path.join(fixture.path, '..', '..'),
      logger,
      'not-here',
      '0.1.0'
    )

    expect(pkgs).toMatchSnapshot()
  })

  it('finds no results for a known package at an unknown version', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(
      fixture.path,
      path.join(fixture.path, '..', '..'),
      logger,
      'instrumented',
      '0.3.0'
    )

    expect(pkgs).toMatchSnapshot()
  })
})
