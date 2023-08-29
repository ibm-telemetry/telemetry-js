/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Truncates a long string to a provided max length and adds some text indicating that the value was
 * cut off.
 *
 * @param str - The string to truncate.
 * @param maxLength - The maximum length of the string (excluding additional text).
 * @returns The input string if it was less than `maxLength`; or a truncated version otherwise.
 */
export function truncateString(str: string, maxLength: number) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '... (truncated)'
  }

  return str
}
