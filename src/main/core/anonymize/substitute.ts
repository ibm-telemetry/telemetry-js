/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TypedKeyMap } from './typed-key-map.js'

const subs = new TypedKeyMap()
let curSub = 1

/**
 * Substitutes keys/values in the raw input based on the provided allowed keys and values.
 *
 * @param raw - A key/value map.
 * @param allowedKeys - The keys to leave untouched.
 * @param allowedValues - The values to leave untouched.
 * @returns The raw object with all specified keys replaced with anonymized versions of their
 * values.
 */
export function substitute<T extends Record<string, unknown>>(
  raw: T,
  allowedKeys: Array<keyof T>,
  allowedValues: unknown[]
): T {
  const substitutedEntries = Object.entries(raw).map(([key, value]) => {
    // Key is not safe. Substitute key and value
    if (!allowedKeys.includes(key)) {
      if (!subs.has(key)) {
        subs.set(key, nextSub())
      }
      if (!subs.has(value)) {
        subs.set(value, nextSub())
      }

      return { key: subs.get(key), value: subs.get(value) }
    }

    // Key is safe. Value is a string that's not safe
    if (typeof value === 'string' && !allowedValues.includes(value)) {
      if (!subs.has(value)) {
        subs.set(value, nextSub())
      }

      return { key, value: subs.get(value) }
    }

    // Key is safe. Value is an object that's not null and not safe
    if (typeof value === 'object' && value !== null && !allowedValues.includes(value)) {
      if (!subs.has(value)) {
        subs.set(value, nextSub())
      }

      return { key, value: subs.get(value) }
    }

    // Both key and value are safe
    return { key, value }
  })

  return substitutedEntries.reduce<Record<string, unknown>>((prev, cur) => {
    prev[cur.key] = cur.value
    return prev
  }, {}) as T
}

function nextSub() {
  return `[redacted${curSub++}]`
}
