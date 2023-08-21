/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Attributes } from '@opentelemetry/api'

/**
 * An extendable base class for all scope metrics. Scope metrics are required to define a name and
 * a method which returns an OpenTelemetry-compatible Attributes object.
 */
export abstract class ScopeMetric {
  /**
   * The OpenTelemetry-style name of this metric to be used in data transfer and storage.
   */
  public abstract readonly name: string

  /**
   * Get all OpenTelemetry Attributes for this metric data point.
   */
  public abstract get attributes(): Attributes

  /**
   * TODO.
   *
   * @param _val - The value to hash.
   * @throws Error because not yet implemented.
   */
  protected hash(_val: string): string {
    throw new Error('Method not yet implemented.')
  }

  /**
   * TODO.
   *
   * @param _val - The value to hash.
   * @throws Error because not yet implemented.
   */
  protected substitute(_val: string): string {
    throw new Error('Method not yet implemented')
  }
}
