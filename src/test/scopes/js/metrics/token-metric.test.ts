/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsScopeAttributes, NpmScopeAttributes } from '@ibm/telemetry-attributes-js'
import { describe, expect, it } from 'vitest'

import { hash } from '../../../../main/core/anonymize/hash.js'
import { ComplexValue } from '../../../../main/scopes/js/complex-value.js'
import type { JsImport, JsToken } from '../../../../main/scopes/js/interfaces.js'
import { TokenMetric } from '../../../../main/scopes/js/metrics/token-metric.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../main/scopes/jsx/constants.js'
import { initLogger } from '../../../__utils/init-logger.js'

describe('class: TokenMetric', () => {
  const logger = initLogger()
  const jsToken: JsToken = {
    name: 'theToken.access1.access2',
    accessPath: ['theToken', 'access1', 'access2'],
    startPos: 0,
    endPos: 0
  }
  const jsImport: JsImport = {
    name: 'theToken',
    path: 'path',
    isDefault: false,
    isAll: false
  }

  it('returns the correct attributes for a standard token', () => {
    const attributes = new TokenMetric(
      jsToken,
      jsImport,
      { name: 'instrumented', version: '1.0.0' },
      logger
    ).attributes

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsScopeAttributes.TOKEN_NAME]: 'theToken.access1.access2',
          [JsScopeAttributes.TOKEN_ACCESS_PATH]: 'theToken access1 access2',
          [NpmScopeAttributes.INSTRUMENTED_RAW]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [NpmScopeAttributes.INSTRUMENTED_NAME]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: undefined
        },
        [
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns the correct attributes for a renamed token', () => {
    const renamedImport = { ...jsImport, name: 'theActualName', rename: 'theToken' }
    const attributes = new TokenMetric(
      jsToken,
      renamedImport,
      {
        name: 'instrumented',
        version: '1.0.0-rc.4'
      },
      logger
    ).attributes

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsScopeAttributes.TOKEN_NAME]: 'theActualName.access1.access2',
          [JsScopeAttributes.TOKEN_ACCESS_PATH]: 'theActualName access1 access2',
          [NpmScopeAttributes.INSTRUMENTED_RAW]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [NpmScopeAttributes.INSTRUMENTED_NAME]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0-rc.4',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: 'rc.4'
        },
        [
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns the correct attributes for a default token', () => {
    const defaultImport = {
      ...jsImport,
      name: DEFAULT_ELEMENT_NAME,
      rename: 'theToken',
      isDefault: true
    }
    const attributes = new TokenMetric(
      jsToken,
      defaultImport,
      {
        name: 'instrumented',
        version: '1.0.0+9999'
      },
      logger
    ).attributes

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsScopeAttributes.TOKEN_NAME]: `${DEFAULT_ELEMENT_NAME}.access1.access2`,
          [JsScopeAttributes.TOKEN_ACCESS_PATH]: `${DEFAULT_ELEMENT_NAME} access1 access2`,
          [NpmScopeAttributes.INSTRUMENTED_RAW]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [NpmScopeAttributes.INSTRUMENTED_NAME]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0+9999',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: undefined
        },
        [
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('redacts an all import name and access path', () => {
    const jsToken: JsToken = {
      name: 'import.aToken',
      accessPath: ['import', 'aToken'],
      startPos: 0,
      endPos: 0
    }
    const allImport: JsImport = {
      name: 'import',
      path: 'instrumented',
      isDefault: false,
      isAll: true
    }

    const attributes = new TokenMetric(
      jsToken,
      allImport,
      {
        name: 'instrumented',
        version: '1.0.0+9999'
      },
      logger
    ).attributes

    expect(attributes[JsScopeAttributes.TOKEN_NAME]).not.toContain('import')
    expect(attributes[JsScopeAttributes.TOKEN_ACCESS_PATH]).not.toContain('import')
  })

  it('redacts complex values', () => {
    const jsToken: JsToken = {
      name: 'import[complex["complex"]]',
      accessPath: ['import', new ComplexValue('complex["complex"]')],
      startPos: 0,
      endPos: 0
    }

    const namedImport: JsImport = {
      name: 'import',
      path: 'instrumented',
      isDefault: false,
      isAll: false
    }

    const attributes = new TokenMetric(
      jsToken,
      namedImport,
      {
        name: 'instrumented',
        version: '1.0.0+9999'
      },
      logger
    ).attributes

    expect(attributes[JsScopeAttributes.TOKEN_NAME]).not.toContain('complex["complex"]')
    expect(attributes[JsScopeAttributes.TOKEN_ACCESS_PATH]).not.toContain('complex["complex"]')
  })

  it('does not redact simple values', () => {
    const jsToken: JsToken = {
      name: 'import["simpleAccess"]',
      accessPath: ['import', 'simpleAccess'],
      startPos: 0,
      endPos: 0
    }

    const namedImport: JsImport = {
      name: 'import',
      path: 'instrumented',
      isDefault: false,
      isAll: false
    }

    const attributes = new TokenMetric(
      jsToken,
      namedImport,
      {
        name: 'instrumented',
        version: '1.0.0+9999'
      },
      logger
    ).attributes

    expect(attributes[JsScopeAttributes.TOKEN_NAME]).toBe('import["simpleAccess"]')
    expect(attributes[JsScopeAttributes.TOKEN_ACCESS_PATH]).toBe('import simpleAccess')
  })
})
