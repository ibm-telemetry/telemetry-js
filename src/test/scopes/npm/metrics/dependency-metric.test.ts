/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { anonymize } from '../../../../main/core/anonymize.js'
import { CustomResourceAttributes } from '../../../../main/core/custom-resource-attributes.js'
import { DependencyMetric } from '../../../../main/scopes/npm/metrics/dependency-metric.js'
import { initLogger } from '../../../__utils/init-logger.js'

describe('dependencyMetric', () => {
  const logger = initLogger()

  it('returns the correct attributes for a standard package', () => {
    const attributes = new DependencyMetric(
      {
        rawName: 'test-1',
        rawVersion: '0.0.1',
        installerRawName: 'test-1-installer',
        installerRawVersion: '1.0.0'
      },
      logger
    ).attributes
    expect(attributes).toStrictEqual(
      anonymize(
        {
          raw: 'test-1',
          owner: undefined,
          name: 'test-1',
          'version.raw': '0.0.1',
          'version.major': '0',
          'version.minor': '0',
          'version.patch': '1',
          'version.preRelease': undefined,
          'installer.name': 'test-1-installer',
          'installer.owner': undefined,
          'installer.raw': 'test-1-installer',
          'installer.version.major': '1',
          'installer.version.minor': '0',
          'installer.version.patch': '0',
          'installer.version.preRelease': undefined,
          'installer.version.raw': '1.0.0'
        },
        {
          hash: [
            'raw',
            'owner',
            'name',
            'version.raw',
            'version.preRelease',
            'installer.raw',
            'installer.owner',
            'installer.name',
            'installer.version.raw',
            'installer.version.preRelease'
          ]
        }
      )
    )
  })

  it('returns the correct attributes for a package with a prerelease', () => {
    const attributes = new DependencyMetric(
      {
        rawName: 'test-1',
        rawVersion: '0.0.1-rc.0',
        installerRawName: 'test-1-installer',
        installerRawVersion: '1.0.0-rc.4'
      },
      logger
    ).attributes
    expect(attributes).toStrictEqual(
      anonymize(
        {
          raw: 'test-1',
          owner: undefined,
          name: 'test-1',
          'installer.name': 'test-1-installer',
          'version.raw': '0.0.1-rc.0',
          'version.major': '0',
          'version.minor': '0',
          'version.patch': '1',
          'version.preRelease': 'rc.0',
          'installer.owner': undefined,
          'installer.raw': 'test-1-installer',
          'installer.version.major': '1',
          'installer.version.minor': '0',
          'installer.version.patch': '0',
          'installer.version.preRelease': 'rc.4',
          'installer.version.raw': '1.0.0-rc.4'
        },
        {
          hash: [
            'raw',
            'owner',
            'name',
            'version.raw',
            'version.preRelease',
            'installer.raw',
            'installer.owner',
            'installer.name',
            'installer.version.raw',
            'installer.version.preRelease'
          ]
        }
      )
    )
  })

  it('returns the correct attributes for a package with metadata', () => {
    const attributes = new DependencyMetric(
      {
        rawName: 'test-1',
        rawVersion: '0.0.1+12345',
        installerRawName: 'test-1-installer',
        installerRawVersion: '1.0.0+9999'
      },
      logger
    ).attributes
    expect(attributes).toStrictEqual(
      anonymize(
        {
          raw: 'test-1',
          owner: undefined,
          name: 'test-1',
          'installer.name': 'test-1-installer',
          'installer.owner': undefined,
          'installer.raw': 'test-1-installer',
          'installer.version.major': '1',
          'installer.version.minor': '0',
          'installer.version.patch': '0',
          'installer.version.preRelease': undefined,
          'installer.version.raw': '1.0.0+9999',
          'version.raw': '0.0.1+12345',
          'version.major': '0',
          'version.minor': '0',
          'version.patch': '1',
          'version.preRelease': undefined
        },
        {
          hash: [
            'raw',
            'owner',
            'name',
            'version.raw',
            'version.preRelease',
            'installer.raw',
            'installer.owner',
            'installer.name',
            'installer.version.raw',
            'installer.version.preRelease'
          ]
        }
      )
    )
  })

  it('returns the correct attributes for a package with a prerelease and metadata', () => {
    const attributes = new DependencyMetric(
      {
        rawName: 'test-1',
        rawVersion: '0.0.1-rc.1+12345',
        installerRawName: 'test-1-installer',
        installerRawVersion: '1.0.0-rc.0+99999'
      },
      logger
    ).attributes

    expect(attributes).toStrictEqual(
      anonymize(
        {
          raw: 'test-1',
          owner: undefined,
          name: 'test-1',
          'installer.name': 'test-1-installer',
          'version.raw': '0.0.1-rc.1+12345',
          'version.major': '0',
          'version.minor': '0',
          'version.patch': '1',
          'version.preRelease': 'rc.1',
          'installer.owner': undefined,
          'installer.raw': 'test-1-installer',
          'installer.version.major': '1',
          'installer.version.minor': '0',
          'installer.version.patch': '0',
          'installer.version.preRelease': 'rc.0',
          'installer.version.raw': '1.0.0-rc.0+99999'
        },
        {
          hash: [
            'raw',
            'owner',
            'name',
            'version.raw',
            'version.preRelease',
            'installer.raw',
            'installer.owner',
            'installer.name',
            'installer.version.raw',
            'installer.version.preRelease'
          ]
        }
      )
    )
  })

  it('returns the correct attributes for a package with an owner', () => {
    const attributes = new DependencyMetric(
      {
        rawName: '@owner/test-1',
        rawVersion: '0.0.1-rc.0+12345',
        installerRawName: '@installer/test-1-installer',
        installerRawVersion: '1.0.0'
      },
      logger
    ).attributes
    expect(attributes).toStrictEqual(
      anonymize(
        {
          raw: '@owner/test-1',
          owner: '@owner',
          name: 'test-1',
          'installer.name': 'test-1-installer',
          'installer.owner': '@installer',
          'installer.raw': '@installer/test-1-installer',
          'installer.version.major': '1',
          'installer.version.minor': '0',
          'installer.version.patch': '0',
          'installer.version.preRelease': undefined,
          'installer.version.raw': '1.0.0',
          'version.raw': '0.0.1-rc.0+12345',
          'version.major': '0',
          'version.minor': '0',
          'version.patch': '1',
          'version.preRelease': 'rc.0'
        },
        {
          hash: [
            'raw',
            'owner',
            'name',
            'version.raw',
            'version.preRelease',
            'installer.raw',
            'installer.owner',
            'installer.name',
            'installer.version.raw',
            'installer.version.preRelease'
          ]
        }
      )
    )
  })

  it('returns undefined prerelease when prerelease is not available in the versions', () => {
    const attributes = new DependencyMetric(
      {
        rawName: '@owner/test-1',
        rawVersion: '0.0.1+12345',
        installerRawName: '@installer/test-1-installer',
        installerRawVersion: '1.0.0+123456'
      },
      logger
    ).attributes

    expect(attributes[CustomResourceAttributes.VERSION_PRE_RELEASE]).toBeUndefined()
    expect(attributes[CustomResourceAttributes.INSTALLER_VERSION_PRE_RELEASE]).toBeUndefined()
  })
})
