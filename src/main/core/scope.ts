/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Loggable } from './log/loggable.js'
import { type ScopeMetric } from './scope-metric.js'

/**
 * The base class for all metric scopes. Subclasses provide a type indicating the format of each
 * metric type captured by this scope.
 *
 * Subclasses will have their `run` method called exactly once by the framework.
 *
 * During execution of the `run` method, subclasses should call `this.capture(...)` as many times as
 * needed to capture individual data points for this scope.
 */
export abstract class Scope extends Loggable {
  /**
   * Entry point for the scope. All scopes run asynchronously.
   */
  public abstract run(): Promise<void>

  /**
   * Captures a data point for a metric.
   *
   * @param metric - The actual metric data.
   */
  protected async capture(metric: ScopeMetric): Promise<void> {
    void this.logger.log('debug', 'I captured some data!')
    void this.logger.log('debug', metric.name)
    void this.logger.log('debug', JSON.stringify(metric.attributes))
  }
}
