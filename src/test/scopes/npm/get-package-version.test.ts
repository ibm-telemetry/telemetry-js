/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getPackageVersion } from '../../../main/scopes/npm/get-package-version.js'

describe('getPackageName', () => {
  it('returns a semantic-like version for this package', () => {
    expect(getPackageVersion()).toMatch(/\d+.\d+.\d+/)
  })
})
