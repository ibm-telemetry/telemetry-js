/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { hash } from '../../../../main/core/anonymize/hash.js'
import { GlobalScopeAttributes } from '../../../../main/scopes/global-scope-attributes.js'
import { DependencyMetric } from '../../../../main/scopes/npm/metrics/dependency-metric.js'
import { NpmScopeAttributes } from '../../../../main/scopes/npm/npm-scope-attributes.js'
import { initLogger } from '../../../__utils/init-logger.js'

describe('class: DependencyMetric', () => {
  const logger = initLogger()

  it('returns the correct attributes for a standard package', () => {
    const attributes = new DependencyMetric(
      {
        rawName: 'test-1',
        rawVersion: '0.0.1',
        isInstrumented: 'false'
      },
      {
        name: 'test-1-instrumented',
        version: '1.0.0'
      },
      logger
    ).attributes
    expect(attributes).toStrictEqual(
      hash(
        {
          [NpmScopeAttributes.RAW]: 'test-1',
          [NpmScopeAttributes.OWNER]: undefined,
          [NpmScopeAttributes.NAME]: 'test-1',
          [NpmScopeAttributes.IS_INSTRUMENTED]: 'false',
          [NpmScopeAttributes.VERSION_RAW]: '0.0.1',
          [NpmScopeAttributes.VERSION_MAJOR]: '0',
          [NpmScopeAttributes.VERSION_MINOR]: '0',
          [NpmScopeAttributes.VERSION_PATCH]: '1',
          [NpmScopeAttributes.VERSION_PRE_RELEASE]: undefined,
          [GlobalScopeAttributes.INSTRUMENTED_RAW]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [GlobalScopeAttributes.INSTRUMENTED_NAME]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: undefined
        },
        [
          'npm.dependency.raw',
          'npm.dependency.owner',
          'npm.dependency.name',
          'npm.dependency.version.raw',
          'npm.dependency.version.preRelease',
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns the correct attributes for a package with a prerelease', () => {
    const attributes = new DependencyMetric(
      {
        rawName: 'test-1',
        rawVersion: '0.0.1-rc.0',
        isInstrumented: 'false'
      },
      {
        name: 'test-1-instrumented',
        version: '1.0.0-rc.4'
      },
      logger
    ).attributes
    expect(attributes).toStrictEqual(
      hash(
        {
          [NpmScopeAttributes.RAW]: 'test-1',
          [NpmScopeAttributes.OWNER]: undefined,
          [NpmScopeAttributes.NAME]: 'test-1',
          [NpmScopeAttributes.IS_INSTRUMENTED]: 'false',
          [NpmScopeAttributes.VERSION_RAW]: '0.0.1-rc.0',
          [NpmScopeAttributes.VERSION_MAJOR]: '0',
          [NpmScopeAttributes.VERSION_MINOR]: '0',
          [NpmScopeAttributes.VERSION_PATCH]: '1',
          [NpmScopeAttributes.VERSION_PRE_RELEASE]: 'rc.0',
          [GlobalScopeAttributes.INSTRUMENTED_RAW]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [GlobalScopeAttributes.INSTRUMENTED_NAME]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0-rc.4',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: 'rc.4'
        },
        [
          'npm.dependency.raw',
          'npm.dependency.owner',
          'npm.dependency.name',
          'npm.dependency.version.raw',
          'npm.dependency.version.preRelease',
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns the correct attributes for a package with metadata', () => {
    const attributes = new DependencyMetric(
      {
        rawName: 'test-1',
        rawVersion: '0.0.1+12345',
        isInstrumented: 'false'
      },
      {
        name: 'test-1-instrumented',
        version: '1.0.0+9999'
      },
      logger
    ).attributes
    expect(attributes).toStrictEqual(
      hash(
        {
          [NpmScopeAttributes.RAW]: 'test-1',
          [NpmScopeAttributes.OWNER]: undefined,
          [NpmScopeAttributes.NAME]: 'test-1',
          [NpmScopeAttributes.IS_INSTRUMENTED]: 'false',
          [NpmScopeAttributes.VERSION_RAW]: '0.0.1+12345',
          [NpmScopeAttributes.VERSION_MAJOR]: '0',
          [NpmScopeAttributes.VERSION_MINOR]: '0',
          [NpmScopeAttributes.VERSION_PATCH]: '1',
          [NpmScopeAttributes.VERSION_PRE_RELEASE]: undefined,
          [GlobalScopeAttributes.INSTRUMENTED_RAW]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [GlobalScopeAttributes.INSTRUMENTED_NAME]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0+9999',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: undefined
        },
        [
          'npm.dependency.raw',
          'npm.dependency.owner',
          'npm.dependency.name',
          'npm.dependency.version.raw',
          'npm.dependency.version.preRelease',
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns the correct attributes for a package with a prerelease and metadata', () => {
    const attributes = new DependencyMetric(
      {
        rawName: 'test-1',
        rawVersion: '0.0.1-rc.1+12345',
        isInstrumented: 'false'
      },
      {
        name: 'test-1-instrumented',
        version: '1.0.0-rc.0+9999'
      },
      logger
    ).attributes

    expect(attributes).toStrictEqual(
      hash(
        {
          [NpmScopeAttributes.RAW]: 'test-1',
          [NpmScopeAttributes.OWNER]: undefined,
          [NpmScopeAttributes.NAME]: 'test-1',
          [NpmScopeAttributes.IS_INSTRUMENTED]: 'false',
          [NpmScopeAttributes.VERSION_RAW]: '0.0.1-rc.1+12345',
          [NpmScopeAttributes.VERSION_MAJOR]: '0',
          [NpmScopeAttributes.VERSION_MINOR]: '0',
          [NpmScopeAttributes.VERSION_PATCH]: '1',
          [NpmScopeAttributes.VERSION_PRE_RELEASE]: 'rc.1',
          [GlobalScopeAttributes.INSTRUMENTED_RAW]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [GlobalScopeAttributes.INSTRUMENTED_NAME]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0-rc.0+9999',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: 'rc.0'
        },
        [
          'npm.dependency.raw',
          'npm.dependency.owner',
          'npm.dependency.name',
          'npm.dependency.version.raw',
          'npm.dependency.version.preRelease',
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns the correct attributes for a package with an owner', () => {
    const attributes = new DependencyMetric(
      {
        rawName: '@owner/test-1',
        rawVersion: '0.0.1-rc.0+12345',
        isInstrumented: 'false'
      },
      {
        name: '@instrumented/test-1-instrumented',
        version: '1.0.0'
      },
      logger
    ).attributes

    expect(attributes).toStrictEqual(
      hash(
        {
          [NpmScopeAttributes.RAW]: '@owner/test-1',
          [NpmScopeAttributes.OWNER]: '@owner',
          [NpmScopeAttributes.NAME]: 'test-1',
          [NpmScopeAttributes.IS_INSTRUMENTED]: 'false',
          [NpmScopeAttributes.VERSION_RAW]: '0.0.1-rc.0+12345',
          [NpmScopeAttributes.VERSION_MAJOR]: '0',
          [NpmScopeAttributes.VERSION_MINOR]: '0',
          [NpmScopeAttributes.VERSION_PATCH]: '1',
          [NpmScopeAttributes.VERSION_PRE_RELEASE]: 'rc.0',
          [GlobalScopeAttributes.INSTRUMENTED_RAW]: '@instrumented/test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_OWNER]: '@instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_NAME]: 'test-1-instrumented',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [GlobalScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: undefined
        },
        [
          'npm.dependency.raw',
          'npm.dependency.owner',
          'npm.dependency.name',
          'npm.dependency.version.raw',
          'npm.dependency.version.preRelease',
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns undefined prerelease when prerelease is not available in the versions', () => {
    const attributes = new DependencyMetric(
      {
        rawName: '@owner/test-1',
        rawVersion: '0.0.1+12345',
        isInstrumented: 'false'
      },
      {
        name: '@instrumented/test-1-instrumented',
        version: '1.0.0+123456'
      },
      logger
    ).attributes

    expect(attributes[NpmScopeAttributes.VERSION_PRE_RELEASE]).toBeUndefined()
    expect(attributes[GlobalScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]).toBeUndefined()
  })
})
