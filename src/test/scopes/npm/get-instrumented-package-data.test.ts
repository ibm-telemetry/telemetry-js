/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getInstrumentedPackageData } from '../../../main/scopes/npm/get-instrumented-package-data.js'

describe('getInstrumentedPackageData', () => {
  it('correctly reads name and version', async () => {
    // TODOASKJOE: we'd have to change the version here everytime
    await expect(getInstrumentedPackageData()).resolves.toStrictEqual({
      name: '@ibm/telemetrics-js',
      version: '0.1.1'
    })
  })
  // TODOASKJOE: is there a way to test for errors here?
})
