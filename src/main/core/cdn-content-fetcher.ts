/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Logger } from './log/logger.js'

// Cache for fetched CDN content to avoid repeated network requests
const contentCache = new Map<string, string[]>()

/**
 * Fetches the content of a CDN JavaScript file and extracts component names
 * from import statements.
 *
 * This is used when a CDN import points to an index file that imports multiple
 * components. We need to fetch the actual file to discover all the components
 * it imports.
 *
 * @param cdnUrl - The full CDN URL to fetch (e.g., https://1.www.s81c.com/carbon/web-components/version/2.46.0/button.min.js).
 * @param logger - Logger instance.
 * @returns Array of component names found in the file's imports, or empty array if fetch fails.
 */
export async function fetchCdnComponentImports(cdnUrl: string, logger: Logger): Promise<string[]> {
  // Check cache first
  const cachedComponents = contentCache.get(cdnUrl)
  if (cachedComponents !== undefined) {
    logger.debug(`CDN content cache hit for ${cdnUrl}`)
    return cachedComponents
  }

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
    const components = extractComponentNames(content, logger)

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
 * Extracts component names from JavaScript content by parsing import statements.
 *
 * Handles various import patterns including minified code:
 * - import './button.js' or import"./button.js" (minified)
 * - import './components/button/button.js'
 * - import("./button.js")
 * - require("./button.js")
 *
 * @param content - The JavaScript file content.
 * @param logger - Logger instance.
 * @returns Array of component names extracted from imports.
 */
function extractComponentNames(content: string, logger: Logger): string[] {
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
   *   import"./component.js"
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
    if (componentName && !isInternalDependency(componentName)) {
      components.add(componentName)
      logger.debug(`Found static import: ${componentName}`)
    } else if (componentName) {
      logger.debug(`Skipped internal dependency: ${componentName}`)
    }
  }

  /**
   * Pattern 2: Dynamic imports
   *   import("./component.js")
   */
  const dynamicImportRegex = /import\s*\(\s*['"]\.\/(?:[^'"]*\/)?([^/'"]+?)(?:\.min)?\.js['"]\s*\)/g

  const dynamicMatches = Array.from(content.matchAll(dynamicImportRegex))
  logger.debug(`Dynamic import regex found ${dynamicMatches.length} matches`)

  for (const match of dynamicMatches) {
    const componentName = match[1]
    if (componentName && !isInternalDependency(componentName)) {
      components.add(componentName)
      logger.debug(`Found dynamic import: ${componentName}`)
    } else if (componentName) {
      logger.debug(`Skipped internal dependency: ${componentName}`)
    }
  }

  /**
   * Pattern 3: CommonJS requires
   *   require("./component.js")
   */
  const requireRegex = /require\s*\(\s*['"]\.\/(?:[^'"]*\/)?([^/'"]+?)(?:\.min)?\.js['"]\s*\)/g

  const requireMatches = Array.from(content.matchAll(requireRegex))
  logger.debug(`Require regex found ${requireMatches.length} matches`)

  for (const match of requireMatches) {
    const componentName = match[1]
    if (componentName && !isInternalDependency(componentName)) {
      components.add(componentName)
      logger.debug(`Found require: ${componentName}`)
    } else if (componentName) {
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
