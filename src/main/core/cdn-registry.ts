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
  private preScanCompleted: boolean = false
  private cdnOnlyMode: boolean = false
  private currentCdnPackage: string | undefined
  private currentCdnVersion: string | undefined

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
   *
   * @param filePath - Absolute path to the HTML file.
   * @param cdnImports - Array of CDN imports found in the file.
   */
  public registerCdnImports(filePath: string, cdnImports: CdnImport[]): void {
    this.cdnImportsByFile.set(filePath, cdnImports)
  }

  /**
   * Gets CDN imports for a specific HTML file.
   *
   * @param filePath - Absolute path to the HTML file.
   * @returns Array of CDN imports, or undefined if file not registered.
   */
  public getCdnImports(filePath: string): CdnImport[] | undefined {
    return this.cdnImportsByFile.get(filePath)
  }

  /**
   * Updates all CDN imports for a specific package@version with a resolved version.
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
    for (const [filePath, cdnImports] of this.cdnImportsByFile.entries()) {
      const updatedImports = cdnImports.map((cdnImport) => {
        if (cdnImport.package === packageName && cdnImport.version === originalVersion) {
          return { ...cdnImport, version: resolvedVersion }
        }
        return cdnImport
      })
      this.cdnImportsByFile.set(filePath, updatedImports)
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
        if (cdnImport.package) {
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
        if (cdnImport.package && cdnImport.version) {
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
   * Enables CDN-only mode, which signals that only CDN metrics should be collected.
   *
   * @param packageName - The CDN package name being processed.
   * @param version - The CDN package version being processed.
   */
  public enableCdnOnlyMode(packageName: string, version: string): void {
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
   * @returns The package name and version, or undefined if not in CDN-only mode.
   */
  public getCurrentCdnPackage(): { name: string; version: string } | undefined {
    if (this.currentCdnPackage && this.currentCdnVersion) {
      return { name: this.currentCdnPackage, version: this.currentCdnVersion }
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
   * Clears all stored CDN import data.
   */
  public clear(): void {
    this.cdnImportsByFile.clear()
    this.processedCdnImports.clear()
    this.preScanCompleted = false
    this.cdnOnlyMode = false
    this.currentCdnPackage = undefined
    this.currentCdnVersion = undefined
  }
}
