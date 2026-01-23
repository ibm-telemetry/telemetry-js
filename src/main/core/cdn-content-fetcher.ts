/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Logger } from './log/logger.js'

// Cache for fetched component maps to avoid repeated network requests
const contentCache = new Map<string, string[]>()

/**
 * Fetches the component map for a CDN package from the collector service.
 *
 * This queries the collector's imports-map endpoint which contains
 * pre-computed mappings of CDN files to their imported components,
 * avoiding the need to fetch and parse minified CDN content.
 *
 * @param cdnUrl - The full CDN URL (e.g.,
 * https://1.www.s81c.com/carbon/web-components/version/2.46.0/button.min.js).
 * @param logger - Logger instance.
 * @param collectorEndpoint - Optional collector endpoint URL (e.g.,
 * 'https://collector.example.com/v1/metrics'). If not provided, falls back
 * to fetching CDN content directly.
 * @param resolvedVersion - Optional resolved version (e.g., "2.46.0" instead
 * of "v2/canary"). If provided, this will be used instead of parsing from
 * the URL.
 * @returns Array of component names for the CDN file, or empty array if fetch fails.
 */
export async function fetchCdnComponentImports(
  cdnUrl: string,
  logger: Logger,
  collectorEndpoint?: string,
  resolvedVersion?: string
): Promise<string[]> {
  // Check cache first
  const cachedComponents = contentCache.get(cdnUrl)
  if (cachedComponents !== undefined) {
    logger.debug(`Component map cache hit for ${cdnUrl}`)
    return cachedComponents
  }

  // If collector endpoint is provided, use it to fetch component map
  if (collectorEndpoint !== undefined && collectorEndpoint !== '') {
    return fetchFromCollector(cdnUrl, logger, collectorEndpoint, resolvedVersion)
  }

  // Fallback to old behavior: fetch and parse CDN content directly
  return fetchFromCdn(cdnUrl, logger)
}

/**
 * Fetches component map from the collector service.
 *
 * @param cdnUrl - The CDN URL.
 * @param logger - Logger instance.
 * @param collectorEndpoint - The collector metrics endpoint URL.
 * @param resolvedVersion - Optional resolved version to use instead of parsing from URL.
 * @returns Array of component names.
 */
async function fetchFromCollector(
  cdnUrl: string,
  logger: Logger,
  collectorEndpoint: string,
  resolvedVersion?: string
): Promise<string[]> {
  // Extract package info from CDN URL
  const { packageName, version: cdnVersion, fileName } = parseCdnUrl(cdnUrl, logger)

  if (packageName === '') {
    logger.debug(`Could not extract package name from CDN URL: ${cdnUrl}`)
    contentCache.set(cdnUrl, [])
    return []
  }

  // Use resolved version if provided, otherwise use CDN version
  const versionToUse = resolvedVersion ?? cdnVersion

  if (versionToUse === '') {
    logger.debug(`No version available for ${packageName}`)
    contentCache.set(cdnUrl, [])
    return []
  }

  try {
    // Convert endpoint to imports-map endpoint
    // Handle both metrics endpoint and logs endpoint formats:
    // - 'https://collector.example.com/v1/metrics' ->
    //   'https://collector.example.com/v1/imports-map'
    // - 'https://collector.example.com/v1/logs' -> 'https://collector.example.com/v1/imports-map'
    let baseEndpoint = collectorEndpoint
    if (baseEndpoint.includes('/metrics')) {
      baseEndpoint = baseEndpoint.split('/metrics')[0] ?? baseEndpoint
    } else if (baseEndpoint.includes('/logs')) {
      baseEndpoint = baseEndpoint.split('/logs')[0] ?? baseEndpoint
    }
    const importsMapUrl = `${baseEndpoint}/imports-map/${encodeURIComponent(packageName)}/${encodeURIComponent(versionToUse)}`

    logger.debug(`Fetching component map from: ${importsMapUrl}`)

    const response = await fetch(importsMapUrl)

    if (!response.ok) {
      logger.debug(
        `Failed to fetch component map from ${importsMapUrl}: ${response.status} ${response.statusText}`
      )
      contentCache.set(cdnUrl, [])
      return []
    }

    const componentMap: Record<string, string[]> = await response.json()

    // Match the CDN file name with the component map keys
    const components = matchComponentsFromMap(componentMap, fileName, logger)

    logger.debug(`Found ${components.length} components for ${fileName}: ${components.join(', ')}`)

    contentCache.set(cdnUrl, components)
    return components
  } catch (error) {
    logger.debug(`Error fetching component map from collector: ${String(error)}`)
    contentCache.set(cdnUrl, [])
    return []
  }
}

/**
 * Fetches and parses CDN content directly (fallback method).
 *
 * @param cdnUrl - The CDN URL.
 * @param logger - Logger instance.
 * @returns Array of component names.
 */
async function fetchFromCdn(cdnUrl: string, logger: Logger): Promise<string[]> {
  try {
    logger.debug(`Fetching CDN content from: ${cdnUrl}`)

    const response = await fetch(cdnUrl)

    if (!response.ok) {
      logger.debug(
        `Failed to fetch CDN content from ${cdnUrl}: ${response.status} ${response.statusText}`
      )
      contentCache.set(cdnUrl, [])
      return []
    }

    const content = await response.text()
    const components = extractComponentNamesFromCDN(content, logger)

    logger.debug(
      `Extracted ${components.length} components from ${cdnUrl}: ${components.join(', ')}`
    )

    contentCache.set(cdnUrl, components)
    return components
  } catch (error) {
    logger.debug(`Error fetching CDN content from ${cdnUrl}: ${String(error)}`)
    contentCache.set(cdnUrl, [])
    return []
  }
}

/**
 * Parses a CDN URL to extract package name, version, and file name.
 *
 * Handles CDN URL formats like:
 * - https://1.www.s81c.com/carbon/web-components/version/2.46.0/button.min.js
 * - https://1.www.s81c.com/carbon/web-components/tag/v2/canary/button.min.js.
 *
 * @param cdnUrl - The CDN URL to parse.
 * @param logger - Logger instance.
 * @returns Object containing packageName, version, and fileName.
 */
function parseCdnUrl(
  cdnUrl: string,
  logger: Logger
): { packageName: string; version: string; fileName: string } {
  try {
    // Known CDN package paths
    const cdnPackages = new Map([
      ['/carbon/web-components/', '@carbon/web-components'],
      ['/carbon-for-ibm-dotcom/', '@carbon/ibmdotcom-web-components']
    ])

    let packageName = ''
    let packagePath = ''

    // Find which package this URL belongs to
    for (const [path, name] of cdnPackages) {
      if (cdnUrl.includes(path)) {
        packageName = name
        packagePath = path
        break
      }
    }

    if (packageName === '') {
      logger.debug(`Unknown CDN package in URL: ${cdnUrl}`)
      return { packageName: '', version: '', fileName: '' }
    }

    // Extract version and file name
    const afterPackage = cdnUrl.split(packagePath)[1]
    if (afterPackage === undefined || afterPackage === '') {
      return { packageName: '', version: '', fileName: '' }
    }

    const segments = afterPackage.split('/')
    let version = ''
    let fileName = ''

    // Handle version format: /version/2.46.0/...
    if (segments[0] === 'version' && segments[1] !== undefined && segments[1] !== '') {
      version = segments[1]
      fileName = segments[segments.length - 1]?.replace('.min.js', '') ?? ''
    }
    // Handle tag format: /tag/v2/canary/...
    else if (
      segments[0] === 'tag' &&
      segments[1] !== undefined &&
      segments[1] !== '' &&
      segments[2] !== undefined &&
      segments[2] !== ''
    ) {
      version = `${segments[1]}/${segments[2]}`
      fileName = segments[segments.length - 1]?.replace('.min.js', '') ?? ''
    }

    logger.debug(`Parsed CDN URL: package=${packageName}, version=${version}, file=${fileName}`)
    return { packageName, version, fileName }
  } catch (error) {
    logger.debug(`Error parsing CDN URL ${cdnUrl}: ${String(error)}`)
    return { packageName: '', version: '', fileName: '' }
  }
}

/**
 * Matches a CDN file name with the component map to find all imported components.
 *
 * The component map has keys like "cds-button", "cds-accordion", etc., and values
 * are arrays of component names that file imports.
 *
 * @param componentMap - The component map from the collector.
 * @param fileName - The CDN file name (without .min.js extension).
 * @param logger - Logger instance.
 * @returns Array of component names found for this file.
 */
function matchComponentsFromMap(
  componentMap: Record<string, string[]>,
  fileName: string,
  logger: Logger
): string[] {
  // The fileName from the CDN URL should match a key in the component map
  // e.g., "button" should match "cds-button" key

  // Try exact match first (with common prefixes)
  const prefixes = ['cds-', 'c4d-', 'c4p-', 'cds-custom-']

  for (const prefix of prefixes) {
    const key = `${prefix}${fileName}`
    if (componentMap[key]) {
      logger.debug(`Found exact match for ${fileName} with key ${key}`)
      return componentMap[key] ?? []
    }
  }

  // Try matching without prefix (in case the key is just the component name)
  if (componentMap[fileName]) {
    logger.debug(`Found match for ${fileName} without prefix`)
    return componentMap[fileName] ?? []
  }

  // If no match found, return empty array
  logger.debug(`No match found in component map for file: ${fileName}`)
  return []
}

/**
 * Extracts component names from JavaScript content by parsing import statements.
 *
 * Handles various import patterns including minified code:
 * - import './button.js' or import"./button.js" (minified)
 * - import './components/button/button.js'
 * - import("./button.js")
 * - require("./button.js").
 *
 * @param content - The JavaScript file content.
 * @param logger - Logger instance.
 * @returns Array of component names extracted from imports.
 */
function extractComponentNamesFromCDN(content: string, logger: Logger): string[] {
  const components = new Set<string>()

  // Log content length and find where imports start
  logger.debug(`Content length: ${content.length} characters`)
  const firstImportIndex = content.indexOf('import')
  logger.debug(`First 'import' found at index: ${firstImportIndex}`)

  if (firstImportIndex >= 0) {
    const importSample = content.substring(firstImportIndex, firstImportIndex + 300)
    logger.debug(`Import section sample: ${importSample}`)
  }

  /**
   * Pattern 1: Static imports
   * Handles both normal and minified code:
   *   import './component.js'
   *   import"./component.js".
   *
   * IMPORTANT:
   * We use [^'"]* instead of .* to avoid greedy matching
   * across multiple imports in minified bundles.
   */
  const staticImportRegex = /import\s*['"]\.\/(?:[^'"]*\/)?([^/'"]+?)(?:\.min)?\.js['"]/g

  const staticMatches = Array.from(content.matchAll(staticImportRegex))
  logger.debug(`Static import regex found ${staticMatches.length} matches`)

  for (const match of staticMatches) {
    const componentName = match[1]
    if (
      componentName !== undefined &&
      componentName !== '' &&
      !isInternalDependency(componentName)
    ) {
      components.add(componentName)
      logger.debug(`Found static import: ${componentName}`)
    } else if (componentName !== undefined && componentName !== '') {
      logger.debug(`Skipped internal dependency: ${componentName}`)
    }
  }

  /**
   * Pattern 2: Dynamic imports
   *   import("./component.js").
   */
  const dynamicImportRegex = /import\s*\(\s*['"]\.\/(?:[^'"]*\/)?([^/'"]+?)(?:\.min)?\.js['"]\s*\)/g

  const dynamicMatches = Array.from(content.matchAll(dynamicImportRegex))
  logger.debug(`Dynamic import regex found ${dynamicMatches.length} matches`)

  for (const match of dynamicMatches) {
    const componentName = match[1]
    if (
      componentName !== undefined &&
      componentName !== '' &&
      !isInternalDependency(componentName)
    ) {
      components.add(componentName)
      logger.debug(`Found dynamic import: ${componentName}`)
    } else if (componentName !== undefined && componentName !== '') {
      logger.debug(`Skipped internal dependency: ${componentName}`)
    }
  }

  /**
   * Pattern 3: CommonJS requires
   *   require("./component.js").
   */
  const requireRegex = /require\s*\(\s*['"]\.\/(?:[^'"]*\/)?([^/'"]+?)(?:\.min)?\.js['"]\s*\)/g

  const requireMatches = Array.from(content.matchAll(requireRegex))
  logger.debug(`Require regex found ${requireMatches.length} matches`)

  for (const match of requireMatches) {
    const componentName = match[1]
    if (
      componentName !== undefined &&
      componentName !== '' &&
      !isInternalDependency(componentName)
    ) {
      components.add(componentName)
      logger.debug(`Found require: ${componentName}`)
    } else if (componentName !== undefined && componentName !== '') {
      logger.debug(`Skipped internal dependency: ${componentName}`)
    }
  }

  logger.debug(`Found ${components.size} unique component imports in content`)

  return Array.from(components)
}

/**
 * Checks if a component name is an internal dependency (has hash suffix or special patterns).
 * Internal dependencies are build artifacts, not actual components.
 *
 * @param componentName - The component name to check.
 * @returns True if it's an internal dependency, false otherwise.
 */
function isInternalDependency(componentName: string): boolean {
  // Skip files with hash suffixes (e.g., "tooltip-content-GYKS4_SW", "lit-element-C8iTMOf2")
  // These are typically build artifacts with content hashes
  if (/-[A-Z0-9_]{8,}$/i.test(componentName)) {
    return true
  }

  // Skip common internal dependencies
  const internalPatterns = [
    'lit-element',
    'property',
    'state',
    'query',
    'settings',
    'directive',
    'unsafe-html',
    '_commonjsHelpers',
    'spread',
    'class-map',
    'focus',
    'carbon-element',
    'host-listener',
    'defs'
  ]

  return internalPatterns.some((pattern) => componentName.startsWith(pattern))
}

/**
 * Clears the CDN content cache (useful for testing).
 */
export function clearCdnContentCache(): void {
  contentCache.clear()
}

// Made with Bob
