/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { type Counter, type Meter, ValueType } from '@opentelemetry/api'

import { deNull } from './de-null.js'
import { Loggable } from './log/loggable.js'
import { type Logger } from './log/logger.js'
import { Trace } from './log/trace.js'
import { OpenTelemetryContext } from './open-telemetry-context.js'
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
   * The OpenTelemetry-style name of this scope to be used in data transfer and storage.
   */
  public abstract readonly name: keyof ConfigSchema['collect']

  /**
   * Entry point for the scope. All scopes run asynchronously.
   */
  public abstract run(): Promise<void>

  /**
   * The metrics captured by this scope.
   */
  public readonly metrics: Record<string, Counter>

  protected readonly config: ConfigSchema
  protected readonly cwd: string
  protected readonly root: string

  private scopeMeter?: Meter

  /**
   * Instantiates a new scope.
   *
   * @param cwd - Current working directory to use when running this scope.
   * @param root - The root-most directory to consider when running this scope.
   * @param config - An object representation of the config file.
   * @param logger - Logger instance to use during logging.
   */
  public constructor(cwd: string, root: string, config: Scope['config'], logger: Logger) {
    super(logger)

    this.cwd = cwd
    this.root = root
    this.config = config
    this.metrics = {}
  }

  /**
   * Captures a data point for a metric.
   *
   * @param dataPoint - The actual metric data.
   */
  @Trace()
  public capture(dataPoint: ScopeMetric): void {
    // Ensure a scope exists
    if (this.scopeMeter === undefined) {
      this.scopeMeter = OpenTelemetryContext.getInstance().getMeterProvider().getMeter(this.name)
    }

    // Ensure a counter exists
    if (this.metrics[dataPoint.name] === undefined) {
      this.metrics[dataPoint.name] = this.scopeMeter.createCounter(dataPoint.name, {
        valueType: ValueType.INT
      })
    }

    // Log the metric
    this.metrics[dataPoint.name]?.add(1, { ...deNull(dataPoint.attributes) })
  }
}
