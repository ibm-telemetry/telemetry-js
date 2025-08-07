/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CDN_LINK_END } from './is-cdn-import.js'

const CDN_PACKAGES = new Map([
  ['@carbon/web-components', '/carbon/web-components/'],
  ['@carbon/ibmdotcom-web-components', '/carbon-for-ibm-dotcom/']
])

export function parseCdnImport(scriptSource: string) {
  const segments = scriptSource.split('/')
  const componentName = segments.pop()?.split(CDN_LINK_END)[0]

  const cdnImport = {
    name: componentName ?? '',
    path: scriptSource,
    package: findPackage(scriptSource),
    isLatest: isLatest(segments)
  }
  return cdnImport
}

function findPackage(parsedLink: string) {
  for (const [pkgName, pkgPath] of CDN_PACKAGES) {
    if (parsedLink.includes(pkgPath)) {
      return pkgName
    }
  }
  return ''
}

function isLatest(segments: string[]) {
  if (segments.includes('latest')) {
    return true
  }
  return false
}
