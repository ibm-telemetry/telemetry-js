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
import { CustomResourceAttributes } from '../../../../main/core/custom-resource-attributes.js'
import { type JsxElement, type JsxImport } from '../../../../main/scopes/jsx/interfaces.js'
import { ElementMetric } from '../../../../main/scopes/jsx/metrics/element-metric.js'
import { initLogger } from '../../../__utils/init-logger.js'

const config: ConfigSchema = {
  projectId: 'abc123',
  version: 1,
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
    raw: '<theName />',
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
    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      prev[cur.name] = cur.value
      return prev
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [CustomResourceAttributes.RAW]: '<theName />',
          [CustomResourceAttributes.NAME]: 'theName',
          [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
          [CustomResourceAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [CustomResourceAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
          [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
          [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: undefined,
          [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
        },
        ['raw', 'invoker.package.raw', 'invoker.package.owner', 'invoker.package.name']
      )
    )
  })
  it('returns the correct attributes for a renamed element', () => {
    const renamedImport = { ...jsxImport, name: 'theActualName', rename: 'theName' }
    const attributes = new ElementMetric(jsxElement, renamedImport, 'the-library', config, logger)
      .attributes
    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      prev[cur.name] = cur.value
      return prev
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [CustomResourceAttributes.RAW]: '<theName />',
          [CustomResourceAttributes.NAME]: 'theActualName',
          [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
          [CustomResourceAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [CustomResourceAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
          [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
          [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: undefined,
          [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
        },
        ['raw', 'invoker.package.raw', 'invoker.package.owner', 'invoker.package.name']
      )
    )
  })
  it('returns the correct attributes for a default element', () => {
    const defaultImport = { ...jsxImport, name: '[Default]', rename: 'theName', isDefault: true }
    const attributes = new ElementMetric(jsxElement, defaultImport, 'the-library', config, logger)
      .attributes
    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      prev[cur.name] = cur.value
      return prev
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [CustomResourceAttributes.RAW]: '<theName />',
          [CustomResourceAttributes.NAME]: '[Default]',
          [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
          [CustomResourceAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [CustomResourceAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
          [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
          [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: undefined,
          [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
        },
        ['raw', 'invoker.package.raw', 'invoker.package.owner', 'invoker.package.name']
      )
    )
  })
  it('returns the correct attributes for an element with no invoker', () => {
    const attributes = new ElementMetric(jsxElement, jsxImport, undefined, config, logger)
      .attributes
    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      prev[cur.name] = cur.value
      return prev
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [CustomResourceAttributes.RAW]: '<theName />',
          [CustomResourceAttributes.NAME]: 'theName',
          [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
          [CustomResourceAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [CustomResourceAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
          [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: undefined,
          [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: undefined,
          [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: undefined
        },
        ['raw', 'invoker.package.raw', 'invoker.package.owner', 'invoker.package.name']
      )
    )
  })
  it('returns the correct attributes for an element with invoker that has owner', () => {
    const attributes = new ElementMetric(jsxElement, jsxImport, '@owner/library', config, logger)
      .attributes

    const attrMap = jsxElement.attributes.reduce<Record<string, unknown>>((prev, cur) => {
      prev[cur.name] = cur.value
      return prev
    }, {})

    const subs = substitute(attrMap, [], [])

    expect(attributes).toStrictEqual(
      hash(
        {
          [CustomResourceAttributes.RAW]: '<theName />',
          [CustomResourceAttributes.NAME]: 'theName',
          [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
          [CustomResourceAttributes.ATTRIBUTE_NAMES]: Object.keys(subs),
          [CustomResourceAttributes.ATTRIBUTE_VALUES]: Object.values(subs),
          [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: '@owner/library',
          [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: '@owner',
          [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'library'
        },
        ['raw', 'invoker.package.raw', 'invoker.package.owner', 'invoker.package.name']
      )
    )
  })
  it('returns the correct attribute name and values for unallowed attributes and values', () => {
    const elementWithAllowedAttrs = {
      ...jsxElement,
      attributes: [
        {
          name: 'unAllowedAttrName',
          value: 'unAllowedAttrValue'
        },
        {
          name: 'allowedAttrName',
          value: 'allowedAttrValue'
        },
        {
          name: 'allowedAttrName',
          value: 'unAllowedAttrValue'
        },
        {
          name: 'unAllowedAttrName',
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
        prev[cur.name] = cur.value
        return prev
      },
      {}
    )

    const substitutedAttributes = substitute(attrMap, ['allowedAttrName'], ['allowedAttrValue'])

    expect(attributes).toStrictEqual(
      hash(
        {
          [CustomResourceAttributes.RAW]: '<theName />',
          [CustomResourceAttributes.NAME]: 'theName',
          [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
          [CustomResourceAttributes.ATTRIBUTE_NAMES]: Object.keys(substitutedAttributes),
          [CustomResourceAttributes.ATTRIBUTE_VALUES]: Object.values(substitutedAttributes),
          [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: '@owner/library',
          [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: '@owner',
          [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'library'
        },
        [
          CustomResourceAttributes.RAW,
          CustomResourceAttributes.INVOKER_PACKAGE_RAW,
          CustomResourceAttributes.INVOKER_PACKAGE_OWNER,
          CustomResourceAttributes.INVOKER_PACKAGE_NAME
        ]
      )
    )
  })
})
