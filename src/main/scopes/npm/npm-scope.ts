/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from '../../core/log/logger.js'
import { Scope } from '../../core/scope.js'
import { type DependencyData, DependencyMetric } from './metrics/dependency-metric.js'
import { getPackageDependencies } from './old/get-package-dependencies.js'

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
    // TODO: implement!

    getPackageDependencies().forEach((dep: DependencyData) => {
      this.capture(new DependencyMetric(dep))
    })
  }
}
