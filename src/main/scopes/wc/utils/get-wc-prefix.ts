/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { wcPrefixMap } from '../wc-defs.js'

/**
 * Return the expected web component prefix value based on a given JS import path.
 *
 * @param path - The JS import path (string).
 * @returns - The expected web component tag prefix (string) or ''.
 */
export function getWcPrefix(path: string): string {
  for (const [pattern, prefix] of wcPrefixMap) {
    if (pattern.test(path)) {
      return prefix
    }
  }
  return ''
}
