/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const CDN_DOMAINS = ['1.www.s81c.com']

/**
 *
 * @param scriptSource
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
