/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Attributes } from '@opentelemetry/api'
import { createHash } from 'crypto'

type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T]

interface AnonymizeConfig<T extends Attributes> {
  hash?: Array<keyof T>
  substitute?: Array<keyof T>
}

/**
 * Anonymizes incoming raw data. The keys to be anonymized are specified in the config object
 * under either the `hash` key or the `substitute` key.
 *
 * @param raw - The attributes to anonymize.
 * @param config - The keys to either hash or substitute.
 * @returns The raw object will all specified keys replaced with anonymized versions of their
 * values.
 */
export function anonymize<T extends Attributes>(
  raw: T,
  config: RequireAtLeastOne<AnonymizeConfig<T>>
) {
  const anonymizedEntries = Object.entries(raw).map(([key, value]) => {
    if (typeof value !== 'string') {
      return { key, value }
    }

    if (config.hash?.includes(key)) {
      const hash = createHash('sha256')
      hash.update(value)
      return { key, value: hash.digest('hex') }
    }

    if (config.substitute?.includes(key)) {
      // TODO: implement this logic
      return { key, value: 'substituted!' }
    }

    return { key, value }
  })

  return anonymizedEntries.reduce<Attributes>((prev, cur) => {
    prev[cur.key] = cur.value
    return prev
  }, {})
}

// TODO: implement
/**
 *
 * @param data
 * @param _hashes
 */
export function hash<T>(data: T, _hashes: unknown) {
  return data
}

// TODO: implement
/**
 *
 * @param data
 * @param _keys
 * @param _values
 */
export function substitute<T>(data: T, _keys: unknown, _values: unknown) {
  return data
}
