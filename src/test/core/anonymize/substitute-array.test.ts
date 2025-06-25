/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { substituteArray } from '../../../main/core/anonymize/substitute-array.js'

describe('substituteArray', () => {
  it('correctly anonymizes sensitive data', () => {
    const arr = ['sensitive value']
    const anonymized = substituteArray(arr, [])

    expect(anonymized).not.toContain('sensitive value')
  })

  it('does not anonymize an allowed value', () => {
    const arr = ['allowed value']

    const anonymized = substituteArray(arr, ['allowed value'])

    expect(anonymized).toContain('allowed value')
  })

  it('reuses a substitution value that appears more than once', () => {
    const arr1 = ['sensitive value']
    const arr2 = ['sensitive value']

    const anon1 = substituteArray(arr1, [])
    const anon2 = substituteArray(arr2, [])

    expect(anon1).not.toContain('sensitive value')
    expect(anon1).toStrictEqual(anon2)
  })

  it('does not anonymize a number', () => {
    const arr = [Number('123')]
    const anon = substituteArray(arr, [])
    expect(anon).toStrictEqual(arr)
  })

  it('does not anonymize a boolean', () => {
    const arr = [true]
    const anon = substituteArray(arr, [])
    expect(anon).toStrictEqual(arr)
  })

  it('does not anonymize a null', () => {
    const arr = [null]
    const anon = substituteArray(arr, [])
    expect(anon).toStrictEqual(arr)
  })

  it('does not anonymize a null', () => {
    const arr = [undefined]
    const anon = substituteArray(arr, [])
    expect(anon).toStrictEqual(arr)
  })
})
