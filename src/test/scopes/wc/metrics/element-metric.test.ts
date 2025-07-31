/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsxScopeAttributes, NpmScopeAttributes } from '@ibm/telemetry-attributes-js'
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { hash } from '../../../../main/core/anonymize/hash.js'
import { substituteObject } from '../../../../main/core/anonymize/substitute-object.js'
import type { JsImport } from '../../../../main/scopes/js/interfaces.js'
import type { WcElement, WcElementAttribute } from '../../../../main/scopes/wc/interfaces.js'
import { ElementMetric } from '../../../../main/scopes/wc/metrics/element-metric.js'
import { initLogger } from '../../../__utils/init-logger.js'

const config: ConfigSchema = {
  projectId: 'abc123',
  version: 1,
  endpoint: '',
  collect: {
    wc: {
      elements: {
        allowedAttributeNames: ['allowedAttrName'],
        allowedAttributeStringValues: ['allowedAttrValue']
      }
    }
  }
}

describe('class: ElementMetric', () => {
  const logger = initLogger()
  const wcElement: WcElement = {
    name: 'theName',
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
    isAll: false,
    isSideEffect: true
  }

  it('returns the correct attributes for an element', () => {
    const attributes = new ElementMetric(
      wcElement,
      jsImport,
      { name: 'instrumented', version: '1.0.0' },
      config,
      logger
    ).attributes
    const attrMap = wcElement.attributes.reduce<Record<string, WcElementAttribute['value']>>(
      (prev, cur) => {
        return { ...prev, [cur.name]: cur.value }
      },
      {}
    )

    const subs = substituteObject(attrMap, [], [])

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

  it('returns the correct attribute name and values for disallowed attributes and values', () => {
    const elementWithAllowedAttrs = {
      ...wcElement,
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

    const substitutedAttributes = substituteObject(
      attrMap,
      ['allowedAttrName'],
      ['allowedAttrValue']
    )

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
