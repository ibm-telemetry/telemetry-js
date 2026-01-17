/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { fetchCdnComponentImports } from '../../../core/cdn-content-fetcher.js'
import type { Logger } from '../../../core/log/logger.js'
import type { CdnImport } from '../interfaces.js'
import { CDN_ENDING, CDN_PACKAGES } from '../wc-defs.js'
import { getWcPrefix } from './get-wc-prefix.js'

/**
 * Parse info from a CDN link and return a CdnImport object.
 *
 * @param scriptSource - A CDN link from an HTML `<script>` tag.
 * @param logger - Optional logger for fetching multi-component imports.
 * @returns - A CdnImport object containing the info parsed from `scriptSource`.
 */
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

/**
 * Parse info from a CDN link and expand it to include all components
 * if the URL points to a file that imports multiple components.
 *
 * This function fetches the CDN file content and extracts all component
 * imports, returning an array of CdnImport objects for each component.
 *
 * @param scriptSource - A CDN link from an HTML `<script>` tag.
 * @param logger - Logger instance for debugging.
 * @returns - Array of CdnImport objects, one for each component found.
 */
export async function parseCdnImportWithExpansion(
  scriptSource: string,
  logger: Logger
): Promise<CdnImport[]> {
  const [packageName, version] = getPackageInfo(scriptSource)
  const componentPrefix = getWcPrefix(packageName)

  // Get the filename component from the URL
  const segments = scriptSource.split('/')
  const filenameComponent = segments.pop()?.split(CDN_ENDING)[0] ?? ''

  // Fetch the CDN file to see if it imports multiple components
  const componentNames = await fetchCdnComponentImports(scriptSource, logger)

  // If no components found (fetch failed or file has no imports),
  // fall back to parsing just the single component from the URL
  if (componentNames.length === 0) {
    logger.debug(`No components found in CDN file, using URL-based component name`)
    return [parseCdnImport(scriptSource)]
  }

  // Always include the filename component if it's not already in the list
  const allComponentNames = new Set(componentNames)
  if (filenameComponent && !allComponentNames.has(filenameComponent)) {
    allComponentNames.add(filenameComponent)
    logger.debug(`Added filename component to expanded list: ${filenameComponent}`)
  }

  // Create a CdnImport for each component found
  const cdnImports: CdnImport[] = Array.from(allComponentNames).map((componentName) => ({
    name: componentName,
    path: scriptSource,
    prefix: componentPrefix,
    package: packageName,
    version: version
  }))

  logger.debug(
    `Expanded CDN import ${scriptSource} into ${cdnImports.length} components: ${Array.from(allComponentNames).join(', ')}`
  )

  return cdnImports
}

/**
 * Parse a package name and version from a CDN link.
 *
 * @param scriptSource - A CDN link from an HTML `<script>` tag.
 * @returns - An array [packageName, packageVersion] parsed from `scriptSource`.
 */
function getPackageInfo(scriptSource: string): [string, string] {
  for (const [pkgName, pkgPath] of CDN_PACKAGES) {
    if (scriptSource.includes(pkgPath)) {
      const details = scriptSource.split(pkgPath)[1]
      const segments = details?.split('/')
      if (segments === undefined) {
        return ['', '']
      }
      if (segments[0] === 'version' && segments[1] !== undefined) {
        return [pkgName, segments[1]]
      }
      if (segments[0] === 'tag' && segments[1] !== undefined && segments[2] !== undefined) {
        return [pkgName, segments[1] + '/' + segments[2]]
      }
    }
  }
  return ['', '']
}
