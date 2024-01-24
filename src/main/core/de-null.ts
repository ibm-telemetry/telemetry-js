/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Removes all key/value pairs from a given object that are nullish. The remaining object contains
 * key/value mappings that are guaranteed to be non-nullish.
 *
 * @param obj - The object to de-null.
 * @returns A new object that is de-null.
 */
export function deNull<T extends Record<string, unknown>>(
  obj: T
): Record<string, NonNullable<T[string]>> {
  return Object.entries(obj).reduce((prev, [key, val]) => {
    if (val === null || val === undefined) {
      return prev
    }

    return { ...prev, [key]: val }
  }, {})
}
