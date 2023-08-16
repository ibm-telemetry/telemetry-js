/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getPackageName } from '../../../main/scopes/npm/get-package-name.js'

describe('getPackageName', () => {
  it('returns the correct package name for this file', () => {
    expect(getPackageName()).toBe('@ibm/telemetrics-js')
  })
})
