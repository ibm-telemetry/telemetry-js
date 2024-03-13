/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Attributes } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import type { MetricReader } from '@opentelemetry/sdk-metrics'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

import { ManualMetricReader } from './manual-metric-reader.js'

interface InitializedOpenTelemetryContext {
  metricReader: MetricReader
  meterProvider: MeterProvider
}

/**
 * Singleton class that encapsulates otel-related resources.
 */
export class OpenTelemetryContext {
  private static instance?: OpenTelemetryContext

  /**
   * Returns a singleton OTelContext instance.
   *
   * @returns A singleton instance.
   */
  public static getInstance(): OpenTelemetryContext {
    if (OpenTelemetryContext.instance === undefined) {
      OpenTelemetryContext.instance = new OpenTelemetryContext()
    }

    return OpenTelemetryContext.instance
  }

  // Protected is used so the `this` type can assert these as non-null
  protected metricReader?: MetricReader
  protected meterProvider?: MeterProvider

  private attributes?: Attributes
  private isInitialized: boolean = false

  private constructor() {}

  private initialize(): asserts this is InitializedOpenTelemetryContext {
    if (this.isInitialized) {
      return
    }

    const resource = Resource.default().merge(
      new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'IBM Telemetry',
        ...this.attributes
      })
    )

    this.metricReader = new ManualMetricReader()
    this.meterProvider = new MeterProvider({ resource, readers: [this.metricReader] })

    this.isInitialized = true
  }

  /**
   * Sets the attributes to be used when initializing OpenTelemetry.
   *
   * @param attributes - The configuration options needed to initialize OpenTelemetry.
   */
  public setAttributes(attributes: Attributes) {
    this.attributes = attributes
  }

  /**
   * Returns the singleton metric reader.
   *
   * @returns The metric reader.
   */
  public getMetricReader(): MetricReader {
    this.initialize()

    return this.metricReader
  }

  /**
   * Returns the singleton meter provider.
   *
   * @returns The meter provider.
   */
  public getMeterProvider(): MeterProvider {
    this.initialize()

    return this.meterProvider
  }
}
