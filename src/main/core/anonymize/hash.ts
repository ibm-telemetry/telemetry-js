/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createHash } from 'crypto'

/**
 * Anonymizes incoming raw data. The keys to be anonymized are specified in the config object
 * under either the `hash` key or the `substitute` key.
 *
 * @param raw - The attributes to anonymize.
 * @param keys - They keys to hash.
 * @returns The raw object with all specified keys replaced with de-identified versions of their
 * values.
 */
export function hash<T extends Record<string, unknown>>(
  raw: T,
  keys: [keyof typeof raw, ...Array<keyof typeof raw>]
): T {
  const hashedEntries = Object.entries(raw).map(([key, value]) => {
    if (typeof value !== 'string') {
      return { key, value }
    }

    if (keys.includes(key)) {
      const hash = createHash('sha256')
      hash.update(value)
      return { key, value: hash.digest('hex') }
    }

    return { key, value }
  })

  return hashedEntries.reduce<Record<string, unknown>>((prev, cur) => {
    prev[cur.key] = cur.value
    return prev
  }, {}) as T
}
