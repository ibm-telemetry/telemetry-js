/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CdnImport } from '../scopes/wc/interfaces.js'

/**
 * Singleton registry to track CDN imports discovered during HTML pre-scan.
 * This prevents duplicate CDN metric collection when WC scope runs normally.
 */
export class CdnRegistry {
  private static instance: CdnRegistry | undefined
  private readonly cdnImportsByFile: Map<string, CdnImport[]> = new Map()
  private readonly processedCdnImports: Set<string> = new Set()
  private readonly expandedCdnImports: Map<string, CdnImport[]> = new Map()
  private preScanCompleted: boolean = false
  private preScanPromise: Promise<void> | undefined
  private cdnOnlyMode: boolean = false
  private currentCdnPackage: string | undefined
  private currentCdnVersion: string | undefined
  private readonly installedPackages: Set<string> = new Set()

  private constructor() {}

  /**
   * Gets the singleton instance of the CDN registry.
   *
   * @returns The CDN registry instance.
   */
  public static getInstance(): CdnRegistry {
    if (CdnRegistry.instance === undefined) {
      CdnRegistry.instance = new CdnRegistry()
    }
    return CdnRegistry.instance
  }

  /**
   * Resets the registry instance (useful for testing).
   */
  public static reset(): void {
    CdnRegistry.instance = undefined
  }

  /**
   * Stores CDN imports discovered in an HTML file.
   * If imports already exist for this file, appends to them.
   *
   * @param filePath - Absolute path to the HTML file.
   * @param cdnImports - Array of CDN imports found in the file.
   */
  public registerCdnImports(filePath: string, cdnImports: CdnImport[]): void {
    const existing = this.cdnImportsByFile.get(filePath) ?? []
    this.cdnImportsByFile.set(filePath, [...existing, ...cdnImports])
  }

  /**
   * Gets CDN imports for a specific HTML file.
   * If expanded imports exist for this file, returns those instead.
   *
   * @param filePath - Absolute path to the HTML file.
   * @returns Array of CDN imports, or undefined if file not registered.
   */
  public getCdnImports(filePath: string): CdnImport[] | undefined {
    // Return expanded imports if available, otherwise return original imports
    return this.expandedCdnImports.get(filePath) ?? this.cdnImportsByFile.get(filePath)
  }

  /**
   * Stores expanded CDN imports for a file (after fetching and parsing CDN content).
   * These expanded imports replace the original imports when retrieving.
   * If expanded imports already exist for this file, appends to them.
   *
   * @param filePath - Absolute path to the HTML file.
   * @param expandedImports - Array of expanded CDN imports.
   */
  public registerExpandedCdnImports(filePath: string, expandedImports: CdnImport[]): void {
    const existing = this.expandedCdnImports.get(filePath) ?? []
    this.expandedCdnImports.set(filePath, [...existing, ...expandedImports])
  }

  /**
   * Gets the original (non-expanded) CDN imports for a specific HTML file.
   *
   * @param filePath - Absolute path to the HTML file.
   * @returns Array of original CDN imports, or undefined if file not registered.
   */
  public getOriginalCdnImports(filePath: string): CdnImport[] | undefined {
    return this.cdnImportsByFile.get(filePath)
  }

  /**
   * Updates all CDN imports for a specific package@version with a resolved version.
   * Updates both original and expanded imports that match the package, version, AND path.
   * This ensures that only imports from the same CDN URL get updated together.
   *
   * @param packageName - The package name to update.
   * @param originalVersion - The original version to match (e.g., "v2/latest").
   * @param resolvedVersion - The resolved version to set (e.g., "2.46.0").
   */
  public updateCdnImportVersions(
    packageName: string,
    originalVersion: string,
    resolvedVersion: string
  ): void {
    // Track which paths we've seen for this package@version to update them together
    const pathsToUpdate = new Set<string>()

    // First pass: identify all unique paths for this package@version
    for (const cdnImports of this.cdnImportsByFile.values()) {
      for (const cdnImport of cdnImports) {
        if (cdnImport.package === packageName && cdnImport.version === originalVersion) {
          pathsToUpdate.add(cdnImport.path)
        }
      }
    }

    // Update original imports - only those matching package, version, AND one
    // of the identified paths
    for (const [filePath, cdnImports] of this.cdnImportsByFile.entries()) {
      const updatedImports = cdnImports.map((cdnImport) => {
        if (
          cdnImport.package === packageName &&
          cdnImport.version === originalVersion &&
          pathsToUpdate.has(cdnImport.path)
        ) {
          return { ...cdnImport, version: resolvedVersion }
        }
        return cdnImport
      })
      this.cdnImportsByFile.set(filePath, updatedImports)
    }

    // Update expanded imports - only those matching package, version, AND one
    // of the identified paths
    for (const [filePath, cdnImports] of this.expandedCdnImports.entries()) {
      const updatedImports = cdnImports.map((cdnImport) => {
        if (
          cdnImport.package === packageName &&
          cdnImport.version === originalVersion &&
          pathsToUpdate.has(cdnImport.path)
        ) {
          return { ...cdnImport, version: resolvedVersion }
        }
        return cdnImport
      })
      this.expandedCdnImports.set(filePath, updatedImports)
    }
  }

  /**
   * Marks a CDN import as processed to prevent duplicate metric collection.
   *
   * @param cdnImport - The CDN import to mark as processed.
   */
  public markAsProcessed(cdnImport: CdnImport): void {
    const key = `${cdnImport.path}|${cdnImport.package}|${cdnImport.version}`
    this.processedCdnImports.add(key)
  }

  /**
   * Checks if a CDN import has already been processed.
   *
   * @param cdnImport - The CDN import to check.
   * @returns True if already processed, false otherwise.
   */
  public isProcessed(cdnImport: CdnImport): boolean {
    const key = `${cdnImport.path}|${cdnImport.package}|${cdnImport.version}`
    return this.processedCdnImports.has(key)
  }

  /**
   * Gets all discovered CDN packages across all HTML files.
   *
   * @returns Set of unique package names found in CDN imports.
   */
  public getDiscoveredPackages(): Set<string> {
    const packages = new Set<string>()
    for (const cdnImports of this.cdnImportsByFile.values()) {
      for (const cdnImport of cdnImports) {
        if (cdnImport.package !== undefined && cdnImport.package !== '') {
          packages.add(cdnImport.package)
        }
      }
    }
    return packages
  }

  /**
   * Gets all unique package@version combinations discovered across all HTML files.
   *
   * @returns Array of objects containing package name and version.
   */
  public getDiscoveredPackageVersions(): Array<{ package: string; version: string }> {
    const packageVersions = new Map<string, { package: string; version: string }>()

    for (const cdnImports of this.cdnImportsByFile.values()) {
      for (const cdnImport of cdnImports) {
        if (
          cdnImport.package !== undefined &&
          cdnImport.package !== '' &&
          cdnImport.version !== undefined &&
          cdnImport.version !== ''
        ) {
          const key = `${cdnImport.package}@${cdnImport.version}`
          if (!packageVersions.has(key)) {
            packageVersions.set(key, {
              package: cdnImport.package,
              version: cdnImport.version
            })
          }
        }
      }
    }

    return Array.from(packageVersions.values())
  }

  /**
   * Checks if any CDN imports have been discovered.
   *
   * @returns True if CDN imports exist, false otherwise.
   */
  public hasCdnImports(): boolean {
    return this.cdnImportsByFile.size > 0
  }

  /**
   * Marks the pre-scan phase as completed.
   */
  public markPreScanCompleted(): void {
    this.preScanCompleted = true
  }

  /**
   * Checks if the pre-scan phase has been completed.
   *
   * @returns True if pre-scan completed, false otherwise.
   */
  public isPreScanCompleted(): boolean {
    return this.preScanCompleted
  }

  /**
   * Attempts to claim the pre-scan work. Returns true if this caller should perform
   * the pre-scan, false if another process is already doing it or has completed it.
   *
   * @returns True if caller should run pre-scan, false otherwise.
   */
  public claimPreScan(): boolean {
    // If already completed, no one should run it
    if (this.preScanCompleted) {
      return false
    }

    // If a pre-scan is in progress, skip it (don't wait)
    if (this.preScanPromise !== undefined) {
      return false
    }

    // Claim the pre-scan by creating a promise marker
    this.preScanPromise = new Promise<void>(() => {
      // This promise is just a marker that pre-scan is in progress
      // It will be replaced with a resolved promise in releasePreScan
    })

    return true
  }

  /**
   * Releases the pre-scan claim, allowing other processes to proceed.
   * Should be called after pre-scan work is complete.
   */
  public releasePreScan(): void {
    this.preScanCompleted = true
    // Resolve the promise to unblock any waiting processes
    if (this.preScanPromise !== undefined) {
      // The promise was created with a resolve function we need to call
      // Since we can't access it directly, we'll just mark as completed
      // and any waiting processes will see the completed flag
      this.preScanPromise = Promise.resolve()
    }
  }

  /**
   * Enables CDN-only mode, which signals that only CDN metrics should be collected.
   * When enabled, ALL versions of the package will be processed in a single burst.
   *
   * @param packageName - The CDN package name being processed.
   * @param version - Optional version for context/logging (not used for filtering).
   */
  public enableCdnOnlyMode(packageName: string, version?: string): void {
    this.cdnOnlyMode = true
    this.currentCdnPackage = packageName
    this.currentCdnVersion = version
  }

  /**
   * Disables CDN-only mode, returning to normal operation.
   */
  public disableCdnOnlyMode(): void {
    this.cdnOnlyMode = false
    this.currentCdnPackage = undefined
    this.currentCdnVersion = undefined
  }

  /**
   * Gets the current CDN package being processed in CDN-only mode.
   *
   * @returns The package name and optional version, or undefined if not in CDN-only mode.
   */
  public getCurrentCdnPackage(): { name: string; version?: string } | undefined {
    if (this.currentCdnPackage !== undefined && this.currentCdnPackage !== '') {
      const result: { name: string; version?: string } = { name: this.currentCdnPackage }
      if (this.currentCdnVersion !== undefined) {
        result.version = this.currentCdnVersion
      }
      return result
    }
    return undefined
  }

  /**
   * Checks if CDN-only mode is enabled.
   *
   * @returns True if CDN-only mode is enabled, false otherwise.
   */
  public isCdnOnlyMode(): boolean {
    return this.cdnOnlyMode
  }

  /**
   * Gets all file paths that have CDN imports registered.
   *
   * @returns Array of file paths with CDN imports.
   */
  public getFilesWithCdnImports(): string[] {
    return Array.from(this.cdnImportsByFile.keys())
  }

  /**
   * Marks a package as installed (will be processed via npm scope).
   *
   * @param packageName - The package name to mark as installed.
   */
  public markPackageAsInstalled(packageName: string): void {
    this.installedPackages.add(packageName)
  }

  /**
   * Checks if a package is marked as installed.
   *
   * @param packageName - The package name to check.
   * @returns True if the package is installed, false otherwise.
   */
  public isPackageInstalled(packageName: string): boolean {
    return this.installedPackages.has(packageName)
  }

  /**
   * Clears all stored CDN import data.
   */
  public clear(): void {
    this.cdnImportsByFile.clear()
    this.processedCdnImports.clear()
    this.expandedCdnImports.clear()
    this.preScanCompleted = false
    this.cdnOnlyMode = false
    this.currentCdnPackage = undefined
    this.currentCdnVersion = undefined
    this.installedPackages.clear()
  }
}
