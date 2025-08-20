/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { PackageDetailsProvider } from '../../main/core/package-details-provider.js'
import { initLogger } from '../__utils/init-logger.js'

describe('class: PackageDetailsProvider', () => {
  describe('getPackageDetails', () => {
    const logger = initLogger()
    const packageDetailsProvider = new PackageDetailsProvider(logger)
    it('returns correct data when provided with version', () => {
      expect(packageDetailsProvider.getPackageDetails('the-package', '0.1.1')).toStrictEqual({
        name: 'the-package',
        owner: undefined,
        major: 0,
        minor: 1,
        patch: 1,
        preRelease: undefined
      })
    })
    it('returns correct data when provided with name only', () => {
      expect(packageDetailsProvider.getPackageDetails('the-package')).toStrictEqual({
        name: 'the-package',
        owner: undefined
      })
    })
    it('returns correct data when provided with name that has owner', () => {
      expect(packageDetailsProvider.getPackageDetails('@owner/the-package', '0.1.1')).toStrictEqual(
        {
          name: 'the-package',
          owner: '@owner',
          major: 0,
          minor: 1,
          patch: 1,
          preRelease: undefined
        }
      )
    })
    it('returns correct data when provided with prerelease information', () => {
      expect(
        packageDetailsProvider.getPackageDetails('@owner/the-package', '0.1.1-rc.0')
      ).toStrictEqual({
        name: 'the-package',
        owner: '@owner',
        major: 0,
        minor: 1,
        patch: 1,
        preRelease: ['rc', 0]
      })
    })
  })
})
