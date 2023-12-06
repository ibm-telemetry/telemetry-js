/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import opentelemetry, { type Attributes } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

import { ManualMetricReader } from './manual-metric-reader.js'

/**
 * Initializes the OpenTelemetry tooling based on the provided config.
 *
 * @param config - The configuration options needed to initialize OpenTelemetry.
 * @returns A metric reader that will contain all collected data.
 */
function initializeOpenTelemetry(config: Attributes) {
  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'IBM Telemetry',
      ...config
    })
  )
  const metricReader = new ManualMetricReader()
  const meterProvider = new MeterProvider({ resource })

  meterProvider.addMetricReader(metricReader)

  // Set this MeterProvider to be global to the app being instrumented.
  // TODOASKJOE: keep this?
  // opentelemetry.metrics.disable()
  opentelemetry.metrics.setGlobalMeterProvider(meterProvider)

  return metricReader
}

export { initializeOpenTelemetry }
