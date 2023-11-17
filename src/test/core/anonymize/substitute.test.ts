/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { substitute } from '../../../main/core/anonymize/substitute.js'

describe('substitute', () => {
  it('correctly anonymizes sensitive data', () => {
    const obj = {
      sensitiveKey: 'sensitive value'
    }
    const anonymized = substitute(obj, [], [])

    expect(anonymized.sensitiveKey).toBeUndefined()
    expect(Object.values(anonymized)).not.toContain('sensitive value')
  })

  it('does not anonymize an allowed key, but anonymizes a sensitive value', () => {
    const obj = {
      knownKey: 'cool sensitive value'
    }
    const anonymized = substitute(obj, ['knownKey'], [])

    expect(anonymized.knownKey).not.toBe('cool sensitive value')
  })

  it('does not anonymize an allowed key/value combo', () => {
    const obj = {
      knownKey: 'known value'
    }
    const anonymized = substitute(obj, ['knownKey'], ['known value'])

    expect(anonymized).toMatchObject({
      knownKey: 'known value'
    })
  })

  it('reuses a substitution key/value that appears more than once', () => {
    const obj1 = {
      sensitiveKey: 'sensitive value'
    }
    const obj2 = {
      sensitiveKey: 'sensitive value'
    }

    const anon1 = substitute(obj1, [], [])
    const anon2 = substitute(obj2, [], [])

    expect(Object.keys(anon1)).toStrictEqual(Object.keys(anon2))
    expect(Object.values(anon1)).toStrictEqual(Object.values(anon2))
  })

  it('anonymizes a sensitive object', () => {
    const obj = {
      knownKey: { some: 'object' }
    }

    substitute(obj, [], [])
    const anonymized = substitute(obj, ['knownKey'], [])

    expect(anonymized).toMatchObject({
      knownKey: '[redacted5]'
    })
  })

  it('anonymizes two identical objects to the same value', () => {
    const obj1 = {
      knownKey: { some: 'object' }
    }
    const obj2 = {
      knownKey: { some: 'object' }
    }

    const anon1 = substitute(obj1, ['knownKey'], [])
    const anon2 = substitute(obj2, ['knownKey'], [])

    expect(anon1.knownKey).toStrictEqual(anon2.knownKey)
  })

  it('manifests an object and a string that looks like the object differently', () => {
    const obj = {
      knownKey1: { some: 'object' },
      knownKey2: "{ some: 'object' }"
    }

    const anon = substitute(obj, ['knownKey1', 'knownKey2'], [])

    expect(anon.knownKey1).not.toBe(anon.knownKey2)
  })
})
