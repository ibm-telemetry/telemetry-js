/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { CdnImport } from '../interfaces.js'
import { getWcPrefix } from './get-wc-prefix.js'

const CDN_ENDING = '.min.js'
const CDN_PACKAGES = new Map([
  ['@carbon/web-components', '/carbon/web-components/'],
  ['@carbon/ibmdotcom-web-components', '/carbon-for-ibm-dotcom/']
])

export function parseCdnImport(scriptSource: string) {
  const segments = scriptSource.split('/')
  const componentName = segments.pop()?.split(CDN_ENDING)[0] ?? ''
  const [packageName, version] = getPackageInfo(scriptSource)
  const componentPrefix = getWcPrefix(packageName)
  const cdnImport: CdnImport = {
    name: componentName,
    path: scriptSource,
    prefix: componentPrefix,
    package: packageName,
    version: version
  }
  return cdnImport
}

function getPackageInfo(scriptSource: string): [string, string] {
  for (const [pkgName, pkgPath] of CDN_PACKAGES) {
    if (scriptSource.includes(pkgPath)) {
      const details = scriptSource.split(pkgPath)[1]
      const segments = details?.split('/')
      if (segments !== undefined && segments[0] === 'version' && segments[1] !== undefined) {
        return [pkgName, segments[1]]
      }
      if (segments?.includes('tag') && segments.includes('latest')) {
        return [pkgName, 'latest']
      }
    }
  }
  return ['', '']
}
