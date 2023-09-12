/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type CollectionResult, type DataPoint, MetricReader } from '@opentelemetry/sdk-metrics'
import { type CommonReaderOptions } from '@opentelemetry/sdk-metrics/build/src/types.js'

interface UnlockedDataPoint extends DataPoint<number> {
  startTime: DataPoint<number>['startTime']
  endTime: DataPoint<number>['endTime']
}

/**
 * A metric reader that can be invoked manually with `collect()` to obtain its metrics.
 */
export class ManualMetricReader extends MetricReader {
  override async collect(options?: CommonReaderOptions | undefined): Promise<CollectionResult> {
    const results = await super.collect(options)

    // Zero out all startTime and EndTime attributes in data points
    results.resourceMetrics.scopeMetrics.forEach((scopeMetric) => {
      scopeMetric.metrics.forEach((metric) => {
        metric.dataPoints.forEach((dataPoint) => {
          const unlocked = dataPoint as UnlockedDataPoint
          unlocked.startTime = [0, 0]
          unlocked.endTime = [0, 0]
        })
      })
    })

    return results
  }

  protected override async onShutdown(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  protected override async onForceFlush(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
