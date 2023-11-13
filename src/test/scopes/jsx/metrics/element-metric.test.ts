/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

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
        allowedAttributeNames: ['firstProp', 'secondProp'],
        allowedAttributeStringValues: ['hi', 'wow']
      }
    }
  }
}
// TODO: incorporate hashing
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

    expect(attributes).toStrictEqual({
      [CustomResourceAttributes.RAW]: '<theName />',
      [CustomResourceAttributes.NAME]: 'theName',
      [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
      [CustomResourceAttributes.ATTRIBUTE_NAMES]: ['attrName'],
      [CustomResourceAttributes.ATTRIBUTE_VALUES]: ['attrValue'],
      [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
      [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: undefined,
      [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
    })
  })
  it('returns the correct attributes for a renamed element', () => {
    const renamedImport = { ...jsxImport, name: 'theActualName', rename: 'theName' }
    const attributes = new ElementMetric(jsxElement, renamedImport, 'the-library', config, logger)
      .attributes

    expect(attributes).toStrictEqual({
      [CustomResourceAttributes.RAW]: '<theName />',
      [CustomResourceAttributes.NAME]: 'theActualName',
      [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
      [CustomResourceAttributes.ATTRIBUTE_NAMES]: ['attrName'],
      [CustomResourceAttributes.ATTRIBUTE_VALUES]: ['attrValue'],
      [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
      [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: undefined,
      [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
    })
  })
  it('returns the correct attributes for a default element', () => {
    const defaultImport = { ...jsxImport, name: '[Default]', rename: 'theName', isDefault: true }
    const attributes = new ElementMetric(jsxElement, defaultImport, 'the-library', config, logger)
      .attributes

    expect(attributes).toStrictEqual({
      [CustomResourceAttributes.RAW]: '<theName />',
      [CustomResourceAttributes.NAME]: '[Default]',
      [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
      [CustomResourceAttributes.ATTRIBUTE_NAMES]: ['attrName'],
      [CustomResourceAttributes.ATTRIBUTE_VALUES]: ['attrValue'],
      [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: 'the-library',
      [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: undefined,
      [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'the-library'
    })
  })
  it('returns the correct attributes for an element with no invoker', () => {
    const attributes = new ElementMetric(jsxElement, jsxImport, undefined, config, logger)
      .attributes

    expect(attributes).toStrictEqual({
      [CustomResourceAttributes.RAW]: '<theName />',
      [CustomResourceAttributes.NAME]: 'theName',
      [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
      [CustomResourceAttributes.ATTRIBUTE_NAMES]: ['attrName'],
      [CustomResourceAttributes.ATTRIBUTE_VALUES]: ['attrValue'],
      [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: undefined,
      [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: undefined,
      [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: undefined
    })
  })
  it('returns the correct attributes for an element with invoker that has owner', () => {
    const attributes = new ElementMetric(jsxElement, jsxImport, '@owner/library', config, logger)
      .attributes

    expect(attributes).toStrictEqual({
      [CustomResourceAttributes.RAW]: '<theName />',
      [CustomResourceAttributes.NAME]: 'theName',
      [CustomResourceAttributes.MODULE_SPECIFIER]: 'path',
      [CustomResourceAttributes.ATTRIBUTE_NAMES]: ['attrName'],
      [CustomResourceAttributes.ATTRIBUTE_VALUES]: ['attrValue'],
      [CustomResourceAttributes.INVOKER_PACKAGE_RAW]: '@owner/library',
      [CustomResourceAttributes.INVOKER_PACKAGE_OWNER]: '@owner',
      [CustomResourceAttributes.INVOKER_PACKAGE_NAME]: 'library'
    })
  })
  it.todo('anonymizes unallowed attributes and values')
})
