/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { DependencyMetric } from '../../../../main/scopes/npm/metrics/dependency-metric.js'

describe('dependencyMetric', () => {
  it('returns the correct attributes for a standard package', () => {
    const attributes = new DependencyMetric({
      name: 'test-1',
      version: '0.0.1',
      installerName: 'test-1-installer',
      installerVersion: '1.0.0'
    }).attributes
    expect(attributes).toStrictEqual({
      raw: 'test-1',
      owner: undefined,
      name: 'test-1',
      'version.raw': '0.0.1',
      'version.major': '0',
      'version.minor': '0',
      'version.patch': '1',
      'version.preRelease': '',
      'installer.name': 'test-1-installer',
      'installer.version': '1.0.0'
    })
  })

  it('returns the correct attributes for a package with a prerelease', () => {
    const attributes = new DependencyMetric({
      name: 'test-1',
      version: '0.0.1-rc.0',
      installerName: 'test-1-installer',
      installerVersion: '1.0.0'
    }).attributes
    expect(attributes).toStrictEqual({
      raw: 'test-1',
      owner: undefined,
      name: 'test-1',
      'installer.name': 'test-1-installer',
      'installer.version': '1.0.0',
      'version.raw': '0.0.1-rc.0',
      'version.major': '0',
      'version.minor': '0',
      'version.patch': '1',
      'version.preRelease': 'rc.0'
    })
  })

  it('returns the correct attributes for a package with metadata', () => {
    const attributes = new DependencyMetric({
      name: 'test-1',
      version: '0.0.1+12345',
      installerName: 'test-1-installer',
      installerVersion: '1.0.0'
    }).attributes
    expect(attributes).toStrictEqual({
      raw: 'test-1',
      owner: undefined,
      name: 'test-1',
      'installer.name': 'test-1-installer',
      'installer.version': '1.0.0',
      'version.raw': '0.0.1+12345',
      'version.major': '0',
      'version.minor': '0',
      'version.patch': '1',
      'version.preRelease': ''
    })
  })

  it('returns the correct attributes for a package with a prerelease and metadata', () => {
    const attributes = new DependencyMetric({
      name: 'test-1',
      version: '0.0.1-rc.0+12345',
      installerName: 'test-1-installer',
      installerVersion: '1.0.0'
    }).attributes
    expect(attributes).toStrictEqual({
      raw: 'test-1',
      owner: undefined,
      name: 'test-1',
      'installer.name': 'test-1-installer',
      'installer.version': '1.0.0',
      'version.raw': '0.0.1-rc.0+12345',
      'version.major': '0',
      'version.minor': '0',
      'version.patch': '1',
      'version.preRelease': 'rc.0'
    })
  })

  it('returns the correct attributes for a package with an owner', () => {
    const attributes = new DependencyMetric({
      name: '@owner/test-1',
      version: '0.0.1-rc.0+12345',
      installerName: 'test-1-installer',
      installerVersion: '1.0.0'
    }).attributes
    expect(attributes).toStrictEqual({
      raw: '@owner/test-1',
      owner: '@owner',
      name: 'test-1',
      'installer.name': 'test-1-installer',
      'installer.version': '1.0.0',
      'version.raw': '0.0.1-rc.0+12345',
      'version.major': '0',
      'version.minor': '0',
      'version.patch': '1',
      'version.preRelease': 'rc.0'
    })
  })
})
