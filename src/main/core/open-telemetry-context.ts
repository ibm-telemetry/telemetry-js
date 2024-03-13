/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Attributes } from '@opentelemetry/api'
import Resources = require('@opentelemetry/resources')
import SdkMetrics = require('@opentelemetry/sdk-metrics')
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

import { ManualMetricReader } from './manual-metric-reader.js'

interface InitializedOpenTelemetryContext {
  metricReader: SdkMetrics.MetricReader
  meterProvider: SdkMetrics.MeterProvider
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
  protected metricReader?: SdkMetrics.MetricReader
  protected meterProvider?: SdkMetrics.MeterProvider

  private attributes?: Attributes
  private isInitialized: boolean = false

  private constructor() {}

  private initialize(): asserts this is InitializedOpenTelemetryContext {
    if (this.isInitialized) {
      return
    }

    const resource = Resources.Resource.default().merge(
      new Resources.Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'IBM Telemetry',
        ...this.attributes
      })
    )

    this.metricReader = new ManualMetricReader()
    this.meterProvider = new SdkMetrics.MeterProvider({ resource, readers: [this.metricReader] })

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
  public getMetricReader(): SdkMetrics.MetricReader {
    this.initialize()

    return this.metricReader
  }

  /**
   * Returns the singleton meter provider.
   *
   * @returns The meter provider.
   */
  public getMeterProvider(): SdkMetrics.MeterProvider {
    this.initialize()

    return this.meterProvider
  }
}
