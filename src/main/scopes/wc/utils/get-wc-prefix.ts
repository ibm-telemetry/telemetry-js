/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { wcPrefixMap } from '../wc-prefix-map.js'

/**
 *
 * @param parts
 */
export function getWcPrefix(parts: string[]): string {
  const importIdentifier = parts.slice(0, 3).join('/')
  const prefix = wcPrefixMap.get(importIdentifier)
  return prefix ?? ''
}
