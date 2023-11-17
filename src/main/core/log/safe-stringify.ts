/*
 * Copyright IBM Corp. 2022, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import util from 'util'

/**
 * Converts any argument to it's string representation using node's util.inspect function.
 *
 * @param arg - The element to stringify.
 * @returns - The string representation of the supplied argument.
 */
export function safeStringify(arg: unknown): string {
  if (typeof arg === 'string') {
    return arg
  }

  return util.inspect(arg, {
    compact: true,
    breakLength: Infinity,
    depth: 20,
    showHidden: false,
    maxArrayLength: 10000,
    maxStringLength: 10000
  })
}
