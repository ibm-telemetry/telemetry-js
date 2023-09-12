/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { findInstallers } from '../../../main/scopes/npm/find-installers.js'
import { Fixture } from '../../__utils/fixture.js'

const testDependencyTree = await new Fixture('dependency-trees/basic-dependency-tree.json').parse()

describe('findInstallers', () => {
  it('returns empty array if dependency does not exist', () => {
    expect(findInstallers(testDependencyTree, 'not-there', '1.0.0')).toStrictEqual([])
  })
  it('returns for a single installer', () => {
    expect(findInstallers(testDependencyTree, 'two', '1.0.0')).toStrictEqual([
      {
        version: '1.0.0',
        name: 'one',
        dependencies: [
          {
            name: 'two',
            version: '1.0.0'
          },
          {
            name: 'four',
            version: '1.0.0'
          },
          {
            name: 'three',
            version: '1.0.0'
          }
        ]
      }
    ])
  })
  it('returns for multiple installers', () => {
    expect(findInstallers(testDependencyTree, 'three', '1.0.0')).toStrictEqual([
      {
        version: '1.0.0',
        name: 'one',
        dependencies: [
          {
            name: 'two',
            version: '1.0.0'
          },
          {
            name: 'four',
            version: '1.0.0'
          },
          {
            name: 'three',
            version: '1.0.0'
          }
        ]
      },
      {
        name: 'two',
        version: '1.0.0',
        dependencies: [
          {
            name: 'three',
            version: '1.0.0'
          }
        ]
      }
    ])
  })
  it('only picks up correct version', () => {
    expect(findInstallers(testDependencyTree, 'four', '1.0.1')).toStrictEqual([
      {
        name: 'three',
        version: '1.0.0',
        dependencies: [
          {
            name: 'four',
            version: '1.0.1'
          }
        ]
      }
    ])
  })
  it('disregards other versions', () => {
    expect(findInstallers(testDependencyTree, 'four', 'not-there')).toStrictEqual([])
  })
})
