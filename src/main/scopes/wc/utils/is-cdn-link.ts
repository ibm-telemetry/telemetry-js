/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CDN_DOMAINS } from '../wc-defs.js'

/**
 * Checks whether a (string) script source is a valid CDN link.
 *
 * @param scriptSource - The script source to evaluate.
 * @returns - (boolean) whether `scriptSource` is a valid CDN link.
 */
export function isCdnLink(scriptSource: string): boolean {
  const parsedLink = scriptSource.split(':')[1]?.replace(/\//gi, '')
  for (const domain of CDN_DOMAINS) {
    if (parsedLink?.startsWith(domain)) {
      return true
    }
  }
  return false
}
