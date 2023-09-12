/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { findInstallersFromTree } from '../../../main/scopes/npm/find-installers-from-tree.js'
import { Fixture } from '../../__utils/fixture.js'

const testDependencyTree = await new Fixture('dependency-trees/basic-dependency-tree.json').parse()

describe('findInstallersFromTree', () => {
  it('returns empty array if dependency does not exist', () => {
    expect(findInstallersFromTree(testDependencyTree, 'not-there', '1.0.0')).toStrictEqual([])
  })
  it('returns for a single installer', () => {
    expect(findInstallersFromTree(testDependencyTree, 'two', '1.0.0')).toStrictEqual([
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
    expect(findInstallersFromTree(testDependencyTree, 'three', '1.0.0')).toStrictEqual([
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
    expect(findInstallersFromTree(testDependencyTree, 'four', '1.0.1')).toStrictEqual([
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
    expect(findInstallersFromTree(testDependencyTree, 'four', 'not-there')).toStrictEqual([])
  })
})
