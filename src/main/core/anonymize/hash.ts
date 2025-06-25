/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createHash } from 'node:crypto'

/**
 * Does the following for each value in the provided `raw` object:
 * - If the value is a string and its corresponding key is in the `keys` array, hash it.
 * - If the value is an array containing strings and its corresponding key is in the `keys` array,
 *   hash all of the strings in the array.
 * - Otherwise, leave the value alone.
 *
 * @param raw - The object to consider for hashing/de-identifying.
 * @param keys - They keys to hash.
 * @returns The raw object with all specified keys replaced with de-identified versions of their
 * values.
 */
export function hash<T extends Record<string, unknown>>(
  raw: T,
  keys: [keyof T, ...Array<keyof T>]
): T {
  const hashedEntries = Object.entries(raw).map(([key, value]) => {
    if (!keys.includes(key)) {
      return [key, value]
    }

    if (Array.isArray(value)) {
      const hashedValues = value.map((val) => {
        if (typeof val !== 'string') {
          return val
        }

        const hash = createHash('sha256')
        hash.update(val)
        return hash.digest('hex')
      })

      return [key, hashedValues]
    }

    if (typeof value !== 'string') {
      return [key, value]
    }

    const hash = createHash('sha256')
    hash.update(value)
    return [key, hash.digest('hex')]
  })

  return Object.fromEntries(hashedEntries)
}
