/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Resource } from '@opentelemetry/resources'
import { MeterProvider } from '@opentelemetry/sdk-metrics'

import { ManualMetricReader } from './manual-metric-reader.js'
import type * as ResourceAttributes from './resource-attributes.js'

interface InitializeOpenTelemetryConfig {
  [ResourceAttributes.EMITTER_NAME]: string
  [ResourceAttributes.EMITTER_VERSION]: string
  [ResourceAttributes.PROJECT_ID]: string
  [ResourceAttributes.ANALYZED_RAW]: string
  [ResourceAttributes.ANALYZED_HOST]: string
  [ResourceAttributes.ANALYZED_OWNER]: string
  [ResourceAttributes.ANALYZED_REPOSITORY]: string
  [ResourceAttributes.DATE]: string
}

function initializeOpenTelemetry(config: InitializeOpenTelemetryConfig) {
  const resource = Resource.default().merge(new Resource({ ...config }))

  const metricReader = new ManualMetricReader()

  const meterProvider = new MeterProvider({ resource })

  meterProvider.addMetricReader(metricReader)

  // TODO: can we get back to only using the global object for this? Or do we still want to have
  // direct access to it via return values from this function?
  // Set this MeterProvider to be global to the app being instrumented.
  // otel.metrics.setGlobalMeterProvider(myServiceMeterProvider)

  return {
    metricReader,
    meterProvider
  }
}

export { initializeOpenTelemetry }
