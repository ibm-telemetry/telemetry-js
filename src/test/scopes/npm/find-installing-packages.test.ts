/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest'

import { findInstallingPackages } from '../../../main/scopes/npm/find-installing-packages.js'
import { Fixture } from '../../__utils/fixture.js'

describe('findInstallingPackages', () => {
  it('correctly finds installing package data', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(fixture.path, 'instrumented', '0.1.0')

    expect(pkgs).toMatchSnapshot()
  })

  it('finds no results for an unknown package', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(fixture.path, 'not-here', '0.1.0')

    expect(pkgs).toMatchSnapshot()
  })

  it('finds no results for an known package at an unknown version', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const pkgs = await findInstallingPackages(fixture.path, 'instrumented', '0.3.0')

    expect(pkgs).toMatchSnapshot()
  })
})
