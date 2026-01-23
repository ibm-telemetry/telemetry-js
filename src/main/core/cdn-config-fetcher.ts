/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from './log/logger.js'

// Cache for fetched configs to avoid repeated network requests
const configCache = new Map<string, string>()

/**
 * Converts CDN version format to npm package version format.
 *
 * CDN URLs have formats like:
 * - `.../tag/v2/canary/...` → version string is "v2/canary"
 * - `.../version/2.35.0-rc.0/...` → version string is "2.35.0-rc.0"
 *
 * Conversion rules:
 * - "v2/canary" → "canary" (current major version uses tag directly)
 * - "v1/canary" → "v1-canary" (older versions use hyphenated format)
 * - "2.35.0-rc.0" → "2.35.0-rc.0" (semantic versions pass through)
 *
 * @param cdnVersion - The version string from CDN import (already parsed from URL).
 * @returns The npm-compatible version string.
 */
export function convertCdnVersionToNpmVersion(cdnVersion: string): string {
  // Handle tag format: v2/canary, v1/canary, etc.
  const tagMatch = cdnVersion.match(/^v(\d+)\/(.+)$/)
  if (tagMatch) {
    const majorVersion = tagMatch[1]
    const tag = tagMatch[2]

    // v2/canary -> canary (current major version uses tag directly)
    if (majorVersion === '2') {
      return tag ?? cdnVersion
    }

    // v1/canary -> v1-canary (older versions use hyphenated format)
    return `v${majorVersion}-${tag}`
  }

  // Semantic version format: 2.35.0-rc.0 (already in correct format)
  // Return as-is
  return cdnVersion
}

/**
 * Normalizes a version string by removing disallowed pre-release identifiers.
 * Only keeps -rc.[number] suffixes, removes canary and other pre-release tags.
 *
 * Examples:
 * - "2.10.0-canary.9663990473.0" → "2.10.0"
 * - "2.35.0-rc.0" → "2.35.0-rc.0"
 * - "2.46.0" → "2.46.0"
 * - "1.5.0-beta.3" → "1.5.0"
 *
 * @param version - The version string to normalize.
 * @returns The normalized version string.
 */
export function normalizeVersion(version: string): string {
  // Match semantic version with optional pre-release and build metadata
  // Format: major.minor.patch[-prerelease][+build]
  const versionMatch = version.match(/^(\d+\.\d+\.\d+)(?:-([^+]+))?(?:\+(.+))?$/)

  if (!versionMatch) {
    // Not a valid semantic version, return as-is
    return version
  }

  const [, baseVersion, prerelease] = versionMatch

  // If no pre-release identifier, return base version
  if (!prerelease) {
    return baseVersion ?? version
  }

  // Check if pre-release is an allowed -rc.[number] format
  if (/^rc\.\d+$/.test(prerelease)) {
    return `${baseVersion}-${prerelease}`
  }

  // Remove all other pre-release identifiers (canary, beta, alpha, etc.)
  return baseVersion ?? version
}

/**
 * Fetches the telemetry config for a CDN package from unpkg.
 * Falls back to null if the config cannot be fetched.
 *
 * @param packageName - The npm package name (e.g., '@carbon/web-components').
 * @param cdnVersion - The CDN version string (e.g., 'v2/canary', 'version/2.8.0').
 * @param logger - Logger instance.
 * @returns Object containing the package's telemetry config and resolved version.
 */
export async function fetchCdnPackageConfig(
  packageName: string,
  cdnVersion: string,
  logger: Logger
): Promise<{ config: string; resolvedVersion: string }> {
  const cacheKey = `${packageName}@${cdnVersion}`

  // Check cache first
  const cachedConfig = configCache.get(cacheKey)
  if (cachedConfig !== undefined) {
    logger.debug(`CDN config cache hit for ${cacheKey}`)
    // Cache format: "resolvedVersion|config"
    const [resolvedVersion, config] = cachedConfig.split('|', 2)
    return { config: config ?? '', resolvedVersion: resolvedVersion ?? cdnVersion }
  }

  try {
    // Convert CDN version to npm version format
    const npmVersion = convertCdnVersionToNpmVersion(cdnVersion)

    // Try to fetch from unpkg
    const configUrl = `https://unpkg.com/${packageName}@${npmVersion}/telemetry.yml`
    logger.debug(`Fetching CDN package config from: ${configUrl}`)

    const response = await fetch(configUrl)

    if (!response.ok) {
      logger.debug(
        `Failed to fetch config from ${configUrl}: ${response.status} ${response.statusText}`
      )
      configCache.set(cacheKey, `${cdnVersion}|`)
      return { config: '', resolvedVersion: cdnVersion }
    }

    // Extract resolved version from the final URL after redirects
    // unpkg redirects @latest to the actual version
    // e.g., /@carbon/web-components@latest/... -> /@carbon/web-components@2.46.0/...
    const finalUrl = response.url
    const versionMatch = finalUrl.match(new RegExp(`${packageName}@([^/]+)/`))
    const rawResolvedVersion = versionMatch?.[1] ?? npmVersion

    // Normalize version to remove canary and other disallowed pre-release identifiers
    // Only -rc.[number] suffixes are allowed
    const resolvedVersion = normalizeVersion(rawResolvedVersion)

    logger.debug(
      `Resolved CDN version: ${cdnVersion} -> ${rawResolvedVersion} -> ${resolvedVersion}`
    )

    const yamlContent = await response.text()
    configCache.set(cacheKey, `${resolvedVersion}|${yamlContent}`)

    return { config: yamlContent, resolvedVersion }
  } catch (error) {
    logger.debug(`Error fetching CDN package config for ${cacheKey}: ${String(error)}`)
    configCache.set(cacheKey, `${cdnVersion}|`)
    return { config: '', resolvedVersion: cdnVersion }
  }
}
