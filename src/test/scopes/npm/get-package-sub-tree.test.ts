/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { InvalidObjectPathError } from '../../../main/exceptions/invalid-object-path-error.js'
import { getPackageSubTree } from '../../../main/scopes/npm/get-package-sub-tree.js'
import { Fixture } from '../../__utils/fixture.js'

const testDependencyTree = await new Fixture('dependency-trees/basic-dependency-tree.json').parse()

describe('getPackageSubTree', () => {
  it('correctly parses top-level-dependency', () => {
    expect(getPackageSubTree(testDependencyTree, [])).toMatchSnapshot()
  })

  it('correctly parses nested dependency', () => {
    expect(getPackageSubTree(testDependencyTree, ['dependencies', 'two'])).toMatchSnapshot()
  })

  it('throws exception if given an invalid path', () => {
    expect(() => getPackageSubTree(testDependencyTree, ['does', 'not', 'exist'])).toThrow(
      InvalidObjectPathError
    )
  })
})
