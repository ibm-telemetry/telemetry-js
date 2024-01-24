/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
   */
  @Trace()
  private async collectDependencies(): Promise<void> {
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
   */
  @Trace()
  public override async run(): Promise<void> {
    const collectorKeys = this.config.collect[this.name]
    if (collectorKeys === undefined || Object.keys(collectorKeys).length === 0) {
      throw new EmptyScopeError(this.name)
    }

    const promises: Array<Promise<void>> = []

    Object.keys(collectorKeys).forEach((key) => {
      switch (key) {
        case 'dependencies':
          promises.push(this.collectDependencies())
          break
      }
    })

    await Promise.allSettled(promises)
  }
}
