/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import getPackageDetails from '../../../main/scopes/npm/get-package-details.js'

describe('getPackageDetails', () => {
  it('returns the correct values for a standard package', () => {
    expect(getPackageDetails('test-1', '0.0.1')).toStrictEqual({
      owner: undefined,
      name: 'test-1',
      major: 0,
      minor: 0,
      patch: 1,
      preRelease: []
    })
  })

  it('returns the correct attributes for a package with a prerelease', () => {
    expect(getPackageDetails('test-1', '0.0.1-rc.0')).toStrictEqual({
      owner: undefined,
      name: 'test-1',
      major: 0,
      minor: 0,
      patch: 1,
      preRelease: ['rc', 0]
    })
  })

  it('returns the correct attributes for a package with metadata', () => {
    expect(getPackageDetails('test-1', '0.0.1+12345')).toStrictEqual({
      name: 'test-1',
      owner: undefined,
      major: 0,
      minor: 0,
      patch: 1,
      preRelease: []
    })
  })

  it('returns the correct attributes for a package with a prerelease and metadata', () => {
    expect(getPackageDetails('test-1', '0.0.1-rc.1+12345')).toStrictEqual({
      owner: undefined,
      name: 'test-1',
      major: 0,
      minor: 0,
      patch: 1,
      preRelease: ['rc', 1]
    })
  })

  it('returns the correct attributes for a package with an owner', () => {
    expect(getPackageDetails('@owner/test-1', '0.0.1-rc.0+12345')).toStrictEqual({
      owner: '@owner',
      name: 'test-1',
      major: 0,
      minor: 0,
      patch: 1,
      preRelease: ['rc', 0]
    })
  })
})
