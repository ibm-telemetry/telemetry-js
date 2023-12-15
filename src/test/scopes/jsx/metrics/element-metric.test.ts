/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { hash } from '../../../../main/core/anonymize/hash.js'
import { substitute } from '../../../../main/core/anonymize/substitute.js'
import {
  type JsxElement,
  JsxElementAttribute,
  type JsxImport
} from '../../../../main/scopes/jsx/interfaces.js'
import { JsxScopeAttributes } from '../../../../main/scopes/jsx/jsx-scope-attributes.js'
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
  const jsxImport: JsxImport = {
    name: 'theName',
    path: 'path',
    isDefault: false,
    isAll: false
  }

  it('returns the correct attributes for a standard element', () => {
    const attributes = new ElementMetric(jsxElement, jsxImport, 'the-library', config, logger)
      .attributes
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
          [JsxScopeAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
          [JsxScopeAttributes.INVOKER_PACKAGE_OWNER]: undefined,
          [JsxScopeAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
        },
        [
          'jsx.element.invoker.package.raw',
          'jsx.element.invoker.package.owner',
          'jsx.element.invoker.package.name'
        ]
      )
    )
  })

  it('returns the correct attributes for a renamed element', () => {
    const renamedImport = { ...jsxImport, name: 'theActualName', rename: 'theName' }
    const attributes = new ElementMetric(jsxElement, renamedImport, 'the-library', config, logger)
      .attributes
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
          [JsxScopeAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
          [JsxScopeAttributes.INVOKER_PACKAGE_OWNER]: undefined,
          [JsxScopeAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
        },
        [
          'jsx.element.invoker.package.raw',
          'jsx.element.invoker.package.owner',
          'jsx.element.invoker.package.name'
        ]
      )
    )
  })

  it('returns the correct attributes for a default element', () => {
    const defaultImport = { ...jsxImport, name: '[Default]', rename: 'theName', isDefault: true }
    const attributes = new ElementMetric(jsxElement, defaultImport, 'the-library', config, logger)
      .attributes
    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      return { ...prev, [cur.name]: cur.value }
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsxScopeAttributes.NAME]: '[Default]',
          [JsxScopeAttributes.MODULE_SPECIFIER]: 'path',
          [JsxScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [JsxScopeAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
          [JsxScopeAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
          [JsxScopeAttributes.INVOKER_PACKAGE_OWNER]: undefined,
          [JsxScopeAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
        },
        [
          'jsx.element.invoker.package.raw',
          'jsx.element.invoker.package.owner',
          'jsx.element.invoker.package.name'
        ]
      )
    )
  })

  it('returns the correct attributes for an element with no invoker', () => {
    const attributes = new ElementMetric(jsxElement, jsxImport, undefined, config, logger)
      .attributes
    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      return { ...prev, [cur.name]: cur.value }
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsxScopeAttributes.NAME]: 'theName',
          [JsxScopeAttributes.MODULE_SPECIFIER]: 'path',
          [JsxScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [JsxScopeAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
          [JsxScopeAttributes.INVOKER_PACKAGE_RAW]: undefined,
          [JsxScopeAttributes.INVOKER_PACKAGE_OWNER]: undefined,
          [JsxScopeAttributes.INVOKER_PACKAGE_NAME]: undefined
        },
        [
          'jsx.element.invoker.package.raw',
          'jsx.element.invoker.package.owner',
          'jsx.element.invoker.package.name'
        ]
      )
    )
  })

  it('returns the correct attributes for an element with invoker that has owner', () => {
    const attributes = new ElementMetric(jsxElement, jsxImport, '@owner/library', config, logger)
      .attributes

    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      return { ...prev, [cur.name]: cur.value }
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsxScopeAttributes.NAME]: 'theName',
          [JsxScopeAttributes.MODULE_SPECIFIER]: 'path',
          [JsxScopeAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [JsxScopeAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
          [JsxScopeAttributes.INVOKER_PACKAGE_RAW]: '@owner/library',
          [JsxScopeAttributes.INVOKER_PACKAGE_OWNER]: '@owner',
          [JsxScopeAttributes.INVOKER_PACKAGE_NAME]: 'library'
        },
        [
          'jsx.element.invoker.package.raw',
          'jsx.element.invoker.package.owner',
          'jsx.element.invoker.package.name'
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
      jsxImport,
      '@owner/library',
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
          [JsxScopeAttributes.INVOKER_PACKAGE_RAW]: '@owner/library',
          [JsxScopeAttributes.INVOKER_PACKAGE_OWNER]: '@owner',
          [JsxScopeAttributes.INVOKER_PACKAGE_NAME]: 'library'
        },
        [
          JsxScopeAttributes.INVOKER_PACKAGE_RAW,
          JsxScopeAttributes.INVOKER_PACKAGE_OWNER,
          JsxScopeAttributes.INVOKER_PACKAGE_NAME
        ]
      )
    )
  })
})
