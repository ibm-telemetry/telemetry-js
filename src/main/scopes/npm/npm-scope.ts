/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CdnRegistry } from '../../core/cdn-registry.js'
import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { findInstallingPackages } from './find-installing-packages.js'
import { getPackageData } from './get-package-data.js'
import { DependencyMetric } from './metrics/dependency-metric.js'

/**
 * Scope class dedicated to data collection from an npm environment.
 */
export class NpmScope extends Scope {
  public override name = 'npm' as const

  /**
   * Finds and generates metrics for all for the instrumented package installation details,
   * along with peer dependencies and the installer.
   *
   * @param cdnMode - Whether to run in CDN-only mode.
   */
  @Trace()
  private async collectDependencies(cdnMode?: boolean): Promise<void> {
    const registry = CdnRegistry.getInstance()

    // Check if we're in CDN-only mode
    if (cdnMode) {
      // Set flag to use CDN-specific OpenTelemetry instance
      this.useCdnInstance = true

      const cdnPackage = registry.getCurrentCdnPackage()
      if (!cdnPackage) {
        this.logger.debug('CDN-only mode enabled but no current CDN package found')
        return
      }

      // Get all unique versions for this package from the registry
      const packageVersions = registry.getDiscoveredPackageVersions()
      const uniqueVersions = packageVersions
        .filter((pv) => pv.package === cdnPackage.name)
        .map((pv) => pv.version)

      this.logger.debug(
        `Collecting ${uniqueVersions.length} self-referential NPM dependencies for CDN package: ${cdnPackage.name}`
      )

      // Create a self-referential dependency metric for each unique version
      for (const version of uniqueVersions) {
        const instrumentedPackage = {
          name: cdnPackage.name,
          version: version
        }

        this.capture(
          new DependencyMetric(
            {
              rawName: cdnPackage.name,
              rawVersion: version,
              isInstrumented: 'true'
            },
            instrumentedPackage,
            this.logger
          )
        )

        this.logger.debug(`Created npm dependency metric for ${cdnPackage.name}@${version}`)
      }

      return
    }

    // Normal mode: collect dependencies from the actual environment
    const instrumentedPackage = await getPackageData(this.cwd, this.cwd, this.logger)
    const installingPackages = await findInstallingPackages(
      this.cwd,
      this.root,
      instrumentedPackage.name,
      ({ value }) => value.version === instrumentedPackage.version,
      this.logger
    )

    installingPackages.forEach((installingPkg) => {
      installingPkg.dependencies.forEach((dependency) => {
        this.capture(
          new DependencyMetric(
            {
              rawName: dependency.name,
              rawVersion: dependency.version,
              isInstrumented:
                dependency.name === instrumentedPackage.name &&
                dependency.version === instrumentedPackage.version
                  ? 'true'
                  : 'false'
            },
            instrumentedPackage,
            this.logger
          )
        )
      })
    })
  }

  /**
   * Entry point for the scope.
   *
   * @param cdnMode - Whether to run in CDN-only mode.
   */
  @Trace()
  public override async run(cdnMode?: boolean): Promise<void> {
    const collectorKeys = this.config.collect[this.name]
    if (collectorKeys === undefined || Object.keys(collectorKeys).length === 0) {
      throw new EmptyScopeError(this.name)
    }

    const promises: Array<Promise<void>> = []

    Object.keys(collectorKeys).forEach((key) => {
      switch (key) {
        case 'dependencies':
          promises.push(this.collectDependencies(cdnMode))
          break
      }
    })

    await Promise.allSettled(promises)
  }
}
