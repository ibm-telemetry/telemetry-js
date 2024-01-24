/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { findInstallersFromTree } from '../../../main/scopes/npm/find-installers-from-tree.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

const testDependencyTree = await new Fixture('dependency-trees/basic-dependency-tree.json').parse()

describe('findInstallersFromTree', () => {
  const logger = initLogger()

  it('returns empty array if dependency does not exist', () => {
    expect(
      findInstallersFromTree(
        testDependencyTree,
        'not-there',
        ({ value }) => value.version === '1.0.0',
        logger
      )
    ).toStrictEqual([])
  })

  it('returns for a single installer', () => {
    expect(
      findInstallersFromTree(
        testDependencyTree,
        'two',
        ({ value }) => value.version === '1.0.0',
        logger
      )
    ).toMatchSnapshot()
  })

  it('returns for multiple installers', () => {
    expect(
      findInstallersFromTree(
        testDependencyTree,
        'three',
        ({ value }) => value.version === '1.0.0',
        logger
      )
    ).toMatchSnapshot()
  })

  it('only picks up correct version', () => {
    expect(
      findInstallersFromTree(
        testDependencyTree,
        'four',
        ({ value }) => value.version === '1.0.1',
        logger
      )
    ).toMatchSnapshot()
  })

  it('disregards other versions', () => {
    expect(
      findInstallersFromTree(
        testDependencyTree,
        'four',
        ({ value }) => value.version === 'not-there',
        logger
      )
    ).toStrictEqual([])
  })
})
