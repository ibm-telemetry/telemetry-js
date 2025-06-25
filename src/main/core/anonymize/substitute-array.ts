/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Substitution } from './substitution.js'

/**
 * Substitutes values in the raw input based on the provided allowed values.
 *
 * @param raw - An array of values.
 * @param allowedValues - The values to leave untouched.
 * @returns The raw array with all non-allowed values replaced with anonymized versions of their
 * values.
 */
export function substituteArray(raw: unknown[], allowedValues: unknown[]): unknown[] {
  const subs = new Substitution()

  return raw.map((value) => {
    // Value is a string that's not safe
    if (typeof value === 'string' && !allowedValues.includes(value)) {
      return subs.put(value)
    }

    // Value is an object that's not null and not safe
    if (typeof value === 'object' && value !== null && !allowedValues.includes(value)) {
      return subs.put(value)
    }

    return value
  })
}
