/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const CDN_DOMAIN = '1.www.s81c.com'
export const CDN_LINK_END = '.min.js'

/**
 *
 * @param scriptSource
 */
export function isCdnImport(scriptSource: string): boolean {
  const parsedLink = scriptSource.split(':')[1]
  if (parsedLink?.startsWith(CDN_DOMAIN) && parsedLink?.endsWith(CDN_LINK_END)) {
    return true
  }
  return false
}
