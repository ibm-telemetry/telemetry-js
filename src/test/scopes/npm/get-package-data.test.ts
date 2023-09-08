/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { NpmPackageGetError } from '../../../main/exceptions/npm-package-get-error.js'
import { getPackageData } from '../../../main/scopes/npm/get-package-data.js'
import { Fixture } from '../../__utils/fixture.js'

describe('getPackageData', () => {
  it('correctly reads name and version', async () => {
    const fixture = new Fixture('mock-packages/mock-package-1')
    expect(getPackageData(fixture.path)).toStrictEqual({ name: 'mock-package-1', version: '1.0.0' })
  })
  it('throws error for non existing directory', async () => {
    expect(() => getPackageData('/made/up/directory')).toThrow(NpmPackageGetError)
  })
})
