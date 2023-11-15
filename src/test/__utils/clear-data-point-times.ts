/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type CollectionResult } from '@opentelemetry/sdk-metrics'

/**
 * Metric timestamps change every run. This function changes them to a fixed value  of zero.
 *
 * @param results - The collection results to consider.
 */
export function clearDataPointTimes(results: CollectionResult) {
  results.resourceMetrics.scopeMetrics.forEach((scopeMetric) => {
    scopeMetric.metrics.forEach((metric) => {
      metric.dataPoints.forEach((dataPoint) => {
        ;(dataPoint as { startTime: [number, number] }).startTime = [0, 0]
        ;(dataPoint as { endTime: [number, number] }).endTime = [0, 0]
      })
    })
  })
}
