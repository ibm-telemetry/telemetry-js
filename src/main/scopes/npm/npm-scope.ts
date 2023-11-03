/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DirectoryEnumerator } from '../../core/directory-enumerator.js'
import { Trace } from '../../core/log/trace.js'
import { runCommand } from '../../core/run-command.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { NoPackageJsonFoundError } from '../../exceptions/no-package-json-found-error.js'
import { findInstallersFromTree } from './find-installers-from-tree.js'
import { getPackageData } from './get-package-data.js'
import { hasNodeModulesFolder } from './has-node-modules-folder.js'
import { type InstallingPackage } from './interfaces.js'
import { DependencyMetric } from './metrics/dependency-metric.js'

/**
 * Scope class dedicated to data collection from an npm environment.
 */
export class NpmScope extends Scope {
  public override name = 'npm' as const

  @Trace()
  private async collectDependencies(): Promise<void> {
    const { name: instrumentedPkgName, version: instrumentedPkgVersion } = await getPackageData(
      this.cwd,
      this.logger
    )
    const installingPackages = await this.findInstallingPackages(
      instrumentedPkgName,
      instrumentedPkgVersion
    )

    installingPackages.forEach((installingPkg) => {
      installingPkg.dependencies.forEach((dependency) => {
        this.capture(
          new DependencyMetric(
            {
              name: dependency.name,
              version: dependency.version,
              installerRawName: installingPkg.name,
              installerRawVersion: installingPkg.version
            },
            this.logger
          )
        )
      })
    })
  }

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

  /**
   * Finds all packages within the project that installed the specified package at the specified
   * version. This is done by starting at the current directory and traversing up the directory
   * structure until an `npm ls` command on one of those directories returns a non-empty list of
   * installers.
   *
   * If no installers were found after the root-most project directory was searched, an empty array
   * is returned.
   *
   * @param packageName - The name of the package to search for.
   * @param packageVersion - The exact version of the package to search for.
   * @returns A possibly empty array of installing packages.
   */
  @Trace()
  public async findInstallingPackages(
    packageName: string,
    packageVersion: string
  ): Promise<InstallingPackage[]> {
    const dirs = await new DirectoryEnumerator(this.logger).find(
      this.cwd,
      this.root,
      hasNodeModulesFolder
    )
    const topMostDir = dirs.pop()

    if (topMostDir === undefined) {
      throw new NoPackageJsonFoundError(this.root, this.cwd)
    }

    // Allow this command to try and obtain results even if it exited with a total or partial error
    const result = await runCommand('npm ls --all --json', this.logger, { cwd: topMostDir }, false)

    const dependencyTree = JSON.parse(result.stdout)

    return findInstallersFromTree(dependencyTree, packageName, packageVersion, this.logger)
  }
}
