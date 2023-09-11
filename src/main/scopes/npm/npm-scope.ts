/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from '../../core/log/logger.js'
import { Scope } from '../../core/scope.js'
import { findInstallingPackages } from './find-installing-packages.js'
import { getInstrumentedPackageData } from './get-instrumented-package-data.js'
import { DependencyMetric } from './metrics/dependency-metric.js'

/**
 * Scope class dedicated to data collection from an npm environment.
 */
export class NpmScope extends Scope {
  protected override logger: Logger
  public name = 'npm'

  /**
   * Constructs an NpmScope.
   *
   * @param logger - Injected logger dependency.
   */
  public constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  public override async run(): Promise<void> {
    const { name: instrumentedPkgName, version: instrumentedPkgVersion } =
      await getInstrumentedPackageData()

    const installingPackages = await findInstallingPackages(
      instrumentedPkgName,
      instrumentedPkgVersion
    )

    installingPackages.forEach((installingPkg) => {
      installingPkg.dependencies.forEach((dependency) => {
        this.capture(
          new DependencyMetric({
            name: dependency.name,
            version: dependency.version,
            installerName: installingPkg.name,
            installerVersion: installingPkg.version
          })
        )
      })
    })
  }
}
