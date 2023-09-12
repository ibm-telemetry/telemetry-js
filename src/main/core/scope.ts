/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import opentelemetry, { type Counter, type Meter } from '@opentelemetry/api'

// TODO: this should come from a separate published package
import { type Schema as Config } from '../../schemas/Schema.js'
import { Loggable } from './log/loggable.js'
import { type Logger } from './log/logger.js'
import { type ScopeMetric } from './scope-metric.js'

export type ScopeName = keyof Config['collect']

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
   * The OpenTelemetry-style name of this scope to be used in data transfer and storage.
   */
  public abstract readonly name: ScopeName

  /**
   * Entry point for the scope. All scopes run asynchronously.
   */
  public abstract run(): Promise<void>

  private scopeMeter?: Meter
  private readonly metrics: Record<string, Counter>
  protected readonly config: Config

  /**
   * Instantiates a new scope.
   *
   * @param config - An object representation of the config file.
   * @param logger - Logger instance to use during logging.
   */
  public constructor(config: Scope['config'], logger: Logger) {
    super(logger)
    this.metrics = {}
    this.config = config
  }

  /**
   * Captures a data point for a metric.
   *
   * @param dataPoint - The actual metric data.
   */
  public capture(dataPoint: ScopeMetric): void {
    // Ensure a scope exists
    if (this.scopeMeter === undefined) {
      this.scopeMeter = opentelemetry.metrics.getMeter(this.name)
    }

    // Ensure a counter exists
    if (this.metrics[dataPoint.name] === undefined) {
      this.metrics[dataPoint.name] = this.scopeMeter.createCounter(dataPoint.name)
    }

    // Log the metric
    this.metrics[dataPoint.name]?.add(1, { ...dataPoint.attributes })
  }
}
