/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsxScopeAttributes, NpmScopeAttributes } from '@ibm/telemetry-attributes-js'
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { hash } from '../../../../main/core/anonymize/hash.js'
import { substitute } from '../../../../main/core/anonymize/substitute-array.js'
import type { JsImport } from '../../../../main/scopes/js/interfaces.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../main/scopes/jsx/constants.js'
import type { JsxElement, JsxElementAttribute } from '../../../../main/scopes/jsx/interfaces.js'
import { ElementMetric } from '../../../../main/scopes/jsx/metrics/element-metric.js'
import { initLogger } from '../../../__utils/init-logger.js'

const config: ConfigSchema = {
  projectId: 'abc123',
  version: 1,
  endpoint: '',
  collect: {
    jsx: {
      elements: {
        allowedAttributeNames: ['allowedAttrName'],
        allowedAttributeStringValues: ['allowedAttrValue']
      }
    }
  }
}

describe('class: ElementMetric', () => {
  const logger = initLogger()
  const jsxElement: JsxElement = {
    name: 'theName',
    prefix: undefined,
    attributes: [
      {
        name: 'attrName',
        value: 'attrValue'
      }
    ]
  }
  const jsImport: JsImport = {
    name: 'theName',
    path: 'path',
    isDefault: false,
    isAll: false
  }

  it('returns the correct attributes for a standard element', () => {
    const attributes = new ElementMetric(
      jsxElement,
      jsImport,
      { name: 'instrumented', version: '1.0.0' },
      config,
      logger
    ).attributes
    const attrMap = jsxElement.attributes.reduce<Record<string, JsxElementAttribute['value']>>(
      (prev, cur) => {
        return { ...prev, [cur.name]: cur.value }
      },
      {}
    )

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsxScopeAttributes.NAME]: 'theName',
          [JsxScopeAttributes.MODULE_SPECIFIER]: 'path',
          [JsxScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [JsxScopeAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
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

  it('returns the correct attributes for a renamed element', () => {
    const renamedImport = { ...jsImport, name: 'theActualName', rename: 'theName' }
    const attributes = new ElementMetric(
      jsxElement,
      renamedImport,
      {
        name: 'instrumented',
        version: '1.0.0-rc.4'
      },
      config,
      logger
    ).attributes
    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      return { ...prev, [cur.name]: cur.value }
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsxScopeAttributes.NAME]: 'theActualName',
          [JsxScopeAttributes.MODULE_SPECIFIER]: 'path',
          [JsxScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [JsxScopeAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
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

  it('returns the correct attributes for a default element', () => {
    const defaultImport = {
      ...jsImport,
      name: DEFAULT_ELEMENT_NAME,
      rename: 'theName',
      isDefault: true
    }
    const attributes = new ElementMetric(
      jsxElement,
      defaultImport,
      {
        name: 'instrumented',
        version: '1.0.0+9999'
      },
      config,
      logger
    ).attributes
    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      return { ...prev, [cur.name]: cur.value }
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsxScopeAttributes.NAME]: DEFAULT_ELEMENT_NAME,
          [JsxScopeAttributes.MODULE_SPECIFIER]: 'path',
          [JsxScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [JsxScopeAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
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

  it('returns the correct attribute name and values for disallowed attributes and values', () => {
    const elementWithAllowedAttrs = {
      ...jsxElement,
      attributes: [
        {
          name: 'disallowedAttrName',
          value: 'disallowedAttrValue'
        },
        {
          name: 'allowedAttrName',
          value: 'allowedAttrValue'
        },
        {
          name: 'allowedAttrName',
          value: 'disallowedAttrValue'
        },
        {
          name: 'disallowedAttrName',
          value: 'allowedAttrValue'
        }
      ]
    }
    const attributes = new ElementMetric(
      elementWithAllowedAttrs,
      jsImport,
      {
        name: '@instrumented/instrumented',
        version: '1.0.0+123456'
      },
      config,
      logger
    ).attributes

    const attrMap = elementWithAllowedAttrs.attributes.reduce<Record<string, unknown>>(
      (prev, cur) => {
        return { ...prev, [cur.name]: cur.value }
      },
      {}
    )

    const substitutedAttributes = substitute(attrMap, ['allowedAttrName'], ['allowedAttrValue'])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsxScopeAttributes.NAME]: 'theName',
          [JsxScopeAttributes.MODULE_SPECIFIER]: 'path',
          [JsxScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(substitutedAttributes),
          [JsxScopeAttributes.ATTRIBUTE_VALUES]: Object.values(substitutedAttributes),
          [NpmScopeAttributes.INSTRUMENTED_RAW]: '@instrumented/instrumented',
          [NpmScopeAttributes.INSTRUMENTED_OWNER]: '@instrumented',
          [NpmScopeAttributes.INSTRUMENTED_NAME]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0+123456',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: undefined
        },
        [
          NpmScopeAttributes.INSTRUMENTED_RAW,
          NpmScopeAttributes.INSTRUMENTED_OWNER,
          NpmScopeAttributes.INSTRUMENTED_NAME,
          NpmScopeAttributes.INSTRUMENTED_VERSION_RAW,
          NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE
        ]
      )
    )
  })
})
