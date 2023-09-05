/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import opentelemetry from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

import { ManualMetricReader } from './manual-metric-reader.js'
import type * as ResourceAttributes from './resource-attributes.js'

interface InitializeOpenTelemetryConfig {
  [ResourceAttributes.EMITTER_NAME]: string
  [ResourceAttributes.EMITTER_VERSION]: string
  [ResourceAttributes.PROJECT_ID]: string
  [ResourceAttributes.ANALYZED_RAW]: string
  [ResourceAttributes.ANALYZED_HOST]: string | undefined
  [ResourceAttributes.ANALYZED_OWNER]: string | undefined
  [ResourceAttributes.ANALYZED_REPOSITORY]: string | undefined
  [ResourceAttributes.DATE]: string
}

/**
 * Initializes the OpenTelemetry tooling based on the provided config.
 *
 * @param config - The configuration options needed to initialize OpenTelemetry.
 * @returns A metric reader that will contain all collected data.
 */
function initializeOpenTelemetry(config: InitializeOpenTelemetryConfig) {
  const resource = Resource.default().merge(
    new Resource({
      // By default, remove the service name attribute, since it is unused
      [SemanticResourceAttributes.SERVICE_NAME]: undefined,
      ...config
    })
  )
  const metricReader = new ManualMetricReader()
  const meterProvider = new MeterProvider({ resource })

  meterProvider.addMetricReader(metricReader)

  // Set this MeterProvider to be global to the app being instrumented.
  opentelemetry.metrics.setGlobalMeterProvider(meterProvider)

  return metricReader
}

export { initializeOpenTelemetry }
