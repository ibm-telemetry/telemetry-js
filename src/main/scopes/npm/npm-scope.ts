/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from '../../core/log/logger.js'
import { Scope } from '../../core/scope.js'
import { getPackageDependencies } from './get-package-dependencies.js'
import { type DependencyData, DependencyMetric } from './metrics/dependency-metric.js'

/**
 * Scope class dedicated to data collection from an npm environment.
 */
export class NpmScope extends Scope {
  protected override logger: Logger

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
    void this.logger.log('debug', '--------------DEPENDENCIES--------------')
    getPackageDependencies('base').forEach((dep) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODOASKJOE
      this.capture(new DependencyMetric(dep as DependencyData))
    })
    void this.logger.log('debug', '--------------DEV DEPENDENCIES--------------')
    getPackageDependencies('dev').forEach((dep) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODOASKJOE
      this.capture(new DependencyMetric(dep as DependencyData))
    })
  }
}
