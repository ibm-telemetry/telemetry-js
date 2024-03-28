/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Substitution } from './substitution.js'

/**
 * Substitutes keys/values in the raw input based on the provided allowed keys and values.
 *
 * @param raw - A key/value map.
 * @param allowedKeys - The keys to leave untouched.
 * @param allowedValues - The values to leave untouched.
 * @returns The raw object with all specified keys replaced with anonymized versions of their
 * values.
 */
export function substituteObject<T extends Record<string, unknown>>(
  raw: T,
  allowedKeys: Array<keyof T>,
  allowedValues: unknown[]
): { [Property in keyof T]: T[Property] extends object ? string : T[Property] } {
  const subs = new Substitution()

  const substitutedEntries = Object.entries(raw).map(([key, value]) => {
    // Key is not safe. Substitute key and value
    if (!allowedKeys.includes(key)) {
      const newKey = subs.put(key)
      const newVal = subs.put(value)

      return [newKey, newVal]
    }

    // Key is safe. Value is a string that's not safe
    if (typeof value === 'string' && !allowedValues.includes(value)) {
      return [key, subs.put(value)]
    }

    // Key is safe. Value is an object that's not null and not safe
    if (typeof value === 'object' && value !== null && !allowedValues.includes(value)) {
      return [key, subs.put(value)]
    }

    // Both key and value are safe
    return [key, value]
  })

  return Object.fromEntries(substitutedEntries)
}
