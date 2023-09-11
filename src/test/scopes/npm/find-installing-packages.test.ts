/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { InvalidObjectPathError } from '../../../main/exceptions/invalid-object-path-error.js'
import { InvalidRootPathError } from '../../../main/exceptions/invalid-root-path-error.js'
import { findInstallers } from '../../../main/scopes/npm/find-installers.js'
import { findNestedDeps } from '../../../main/scopes/npm/find-nested-deps.js'
import { findScannableDirectories } from '../../../main/scopes/npm/find-scannable-directories.js'
import { getPackageSubTree } from '../../../main/scopes/npm/get-package-sub-tree.js'
import { hasNodeModulesFolder } from '../../../main/scopes/npm/has-node-modules-folder.js'
import { Fixture } from '../../__utils/fixture.js'

const testDependencyTree = await new Fixture('mock-packages/mock-package-1/dependency-tree.json').parse()

describe('findInstallers', () => {
  it('returns empty array if dependency does not exist', () => {
    expect(findInstallers(testDependencyTree, 'not-there', '1.0.0')).toStrictEqual([])
  })
  it('returns for a single installer', () => {
    expect(findInstallers(testDependencyTree, 'two', '1.0.0')).toStrictEqual([{
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
    }])
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
    expect(findInstallers(testDependencyTree, 'four', '1.0.1')).toStrictEqual([{
      name: 'three',
      version: '1.0.0',
      dependencies: [
        {
          name: 'four',
          version: '1.0.1'
        }
      ]
    }])
  })
  it('disregards other versions', () => {
    expect(findInstallers(testDependencyTree, 'four', 'not-there')).toStrictEqual([])
  })
})

describe('findScannableDirectories', () => {
  it('correctly retrieves list of directories', async () => {
    const rootFixture = new Fixture('mock-packages/mock-package-1')
    const fixture = new Fixture('mock-packages/mock-package-1/node_modules/nested-dep')

    await expect(findScannableDirectories(fixture.path, rootFixture.path)).resolves.toHaveLength(2)
  })
  it('returns empty if no valid dirs', async () => {
    const rootFixture = new Fixture('')
    const fixture = new Fixture('config-files/invalid/missing-keys')
    await expect(findScannableDirectories(fixture.path, rootFixture.path)).resolves.toHaveLength(0)
  })
  it('throws error when cwd is not contained in the root', async () => {
    const rootFixture = new Fixture('config-files/valid')
    const fixture = new Fixture('config-files/invalid/missing-keys')
    await expect(findScannableDirectories(fixture.path, rootFixture.path)).rejects.toThrow(InvalidRootPathError)
  })
})

describe('hasNodeModulesFolder', () => {
  it('returns true if node_modules exist', async () => {
    const fixture = new Fixture('mock-packages/mock-package-1')
    await expect(hasNodeModulesFolder(fixture.path)).resolves.toBeTruthy()
  })

  it('returns false if node_modules does not exist', async () => {
    const fixture = new Fixture('config-files')
    await expect(hasNodeModulesFolder(fixture.path)).resolves.toBeFalsy()
  })
})

describe('findNestedDeps', () => {
  it('returns empty array if there are no matches', () => {
    expect(findNestedDeps(testDependencyTree, 'not-there', '1.0.0')).toStrictEqual([])
  })

  it('returns for a single match', () => {
    expect(findNestedDeps(testDependencyTree, 'two', '1.0.0')).toStrictEqual([['dependencies', 'two']])
  })

  it('returns for multiple matches', () => {
    expect(findNestedDeps(testDependencyTree, 'three', '1.0.0')).toStrictEqual([
      ['dependencies', 'three'], ['dependencies', 'two', 'dependencies', 'three']
    ])
  })

  it('only picks up correct version', () => {
    expect(findNestedDeps(testDependencyTree, 'four', '1.0.1')).toStrictEqual([[
      'dependencies',
      'two',
      'dependencies',
      'three',
      'dependencies',
      'four']])
  })

  it('disregards other versions', () => {
    expect(findNestedDeps(testDependencyTree, 'four', 'not-there')).toStrictEqual([])
  })
})

describe('getPackageSubTree', () => {
  it('correctly parses top-level-dependency', () => {
    expect(getPackageSubTree(testDependencyTree, [])).toStrictEqual({
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
    })
  })
  it('correctly parses nested dependency', () => {
    expect(getPackageSubTree(testDependencyTree, ['dependencies', 'two'])).toStrictEqual({
      name: 'two',
      version: '1.0.0',
      dependencies: [
        {
          name: 'three',
          version: '1.0.0'
        }
      ]
    })
  })
  it('throws exception if given an invalid path', () => {
    expect(() => getPackageSubTree(testDependencyTree, ['does', 'not', 'exist'])).toThrow(InvalidObjectPathError)
  })
})
