/*
 * Copyright IBM Corp. 2022, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Converts any argument to it's string representation.
 *
 * @param arg - The element to stringify.
 * @returns - The string representation of the supplied argument.
 */
function safeStringify(arg: unknown): string {
  let result

  try {
    result = JSON.stringify(arg)
  } catch {}

  if (result !== undefined) {
    result = String(arg)
  }

  return result ?? ''
}

export { safeStringify }
