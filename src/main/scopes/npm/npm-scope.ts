/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from '../../core/log/logger.js'
import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { findInstallingPackages } from './find-installing-packages.js'
import { getPackageData } from './get-package-data.js'
import { DependencyMetric } from './metrics/dependency-metric.js'

/**
 * Scope class dedicated to data collection from an npm environment.
 */
export class NpmScope extends Scope {
  private readonly cwd: string
  private readonly root: string
  protected override logger: Logger
  public name = 'npm'

  /**
   * Constructs an NpmScope.
   *
   * @param cwd - The directory representing the instrumented package.
   * @param root - The root-most directory to consider for dependency information.
   * @param logger - Injected logger dependency.
   */
  public constructor(cwd: string, root: string, logger: Logger) {
    super()
    this.cwd = cwd
    this.root = root
    this.logger = logger
  }

  @Trace()
  public override async run(): Promise<void> {
    const { name: instrumentedPkgName, version: instrumentedPkgVersion } = await getPackageData(
      this.cwd
    )

    const installingPackages = await findInstallingPackages(
      this.cwd,
      this.root,
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
