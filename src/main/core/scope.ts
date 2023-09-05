/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import opentelemetry, { type Counter, type Meter } from '@opentelemetry/api'

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
   * The OpenTelemetry-style name of this scope to be used in data transfer and storage.
   */
  public abstract readonly name: string

  /**
   * Entry point for the scope. All scopes run asynchronously.
   */
  public abstract run(): Promise<void>

  private scope?: Meter

  private readonly metrics: Record<string, Counter>

  /**
   * Instantiates a new scope.
   */
  protected constructor() {
    super()
    this.metrics = {}
  }

  /**
   * Captures a data point for a metric.
   *
   * @param metric - The actual metric data.
   */
  protected capture(metric: ScopeMetric): void {
    // Ensure a scope exists
    if (this.scope === undefined) {
      this.scope = opentelemetry.metrics.getMeter(this.name)
    }

    // Ensure a counter exists
    if (this.metrics[metric.name] === undefined) {
      this.metrics[metric.name] = this.scope.createCounter(metric.name)
    }

    // Log the metric
    this.metrics[metric.name]?.add(1, { ...metric.attributes })
  }
}
