/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { ComplexValue } from '../../../../main/scopes/js/complex-value.js'
import { expandObjectAttributes } from '../../../../main/scopes/js/utils/expand-object-attributes.js'

describe('expandObjectAttributes', () => {
  it('expands an allowed object attribute into dotted sub-key entries', () => {
    const attrMap = {
      myProp: new ComplexValue({ key1: 'hello', key2: 42 })
    }

    const { expanded, addedKeys } = expandObjectAttributes(attrMap, ['myProp'], ['key1', 'key2'])

    expect(expanded).toMatchObject({
      myProp: attrMap.myProp,
      'myProp.key1': 'hello',
      'myProp.key2': 42
    })
    expect(addedKeys).toContain('myProp')
    expect(addedKeys).toContain('myProp.key1')
    expect(addedKeys).toContain('myProp.key2')
  })

  it('always includes the original attribute name in addedKeys when expanding', () => {
    const attrMap = { myProp: new ComplexValue({ key1: true }) }

    const { addedKeys } = expandObjectAttributes(attrMap, ['myProp'], ['key1'])

    expect(addedKeys).toContain('myProp')
  })

  it('emits dotted sub-keys not in allowedAttributeObjectKeys but omits them from addedKeys', () => {
    const attrMap = {
      myProp: new ComplexValue({ allowed: true, notAllowed: 'secret' })
    }

    const { expanded, addedKeys } = expandObjectAttributes(attrMap, ['myProp'], ['allowed'])

    expect('myProp.notAllowed' in expanded).toBe(true)
    expect(addedKeys).not.toContain('myProp.notAllowed')
    expect(addedKeys).toContain('myProp.allowed')
  })

  it('passes through non-object attributes unchanged', () => {
    const attrMap = {
      strAttr: 'hello',
      numAttr: 42,
      boolAttr: true
    }

    const { expanded, addedKeys } = expandObjectAttributes(
      attrMap,
      ['strAttr', 'numAttr', 'boolAttr'],
      ['key1']
    )

    expect(expanded).toStrictEqual(attrMap)
    expect(addedKeys).toHaveLength(0)
  })

  it('does not expand attributes not in allowedAttributeNames', () => {
    const attrMap = {
      notAllowed: new ComplexValue({ key1: true })
    }

    const { expanded, addedKeys } = expandObjectAttributes(attrMap, [], ['key1'])

    expect(expanded).toStrictEqual(attrMap)
    expect(addedKeys).toHaveLength(0)
  })

  it('does not expand a ComplexValue wrapping an array', () => {
    const attrMap = {
      myProp: new ComplexValue([1, 2, 3])
    }

    const { expanded, addedKeys } = expandObjectAttributes(attrMap, ['myProp'], ['0'])

    expect(expanded).toStrictEqual(attrMap)
    expect(addedKeys).toHaveLength(0)
  })

  it('returns an empty expanded map and no addedKeys for an empty attrMap', () => {
    const { expanded, addedKeys } = expandObjectAttributes({}, ['myProp'], ['key1'])

    expect(expanded).toStrictEqual({})
    expect(addedKeys).toHaveLength(0)
  })

  it('handles multiple object attributes independently', () => {
    const attrMap = {
      propA: new ComplexValue({ x: 1 }),
      propB: new ComplexValue({ y: 2 }),
      plain: 'text'
    }

    const { expanded, addedKeys } = expandObjectAttributes(
      attrMap,
      ['propA', 'propB', 'plain'],
      ['x', 'y']
    )

    expect(expanded['propA.x']).toBe(1)
    expect(expanded['propB.y']).toBe(2)
    expect(expanded['plain']).toBe('text')
    expect(addedKeys).toContain('propA')
    expect(addedKeys).toContain('propA.x')
    expect(addedKeys).toContain('propB')
    expect(addedKeys).toContain('propB.y')
    expect(addedKeys).not.toContain('plain')
  })
})
