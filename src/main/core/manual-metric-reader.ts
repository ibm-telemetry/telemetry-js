/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { CollectionResult } from '@opentelemetry/sdk-metrics'
import { MetricReader } from '@opentelemetry/sdk-metrics'
import type { CommonReaderOptions } from '@opentelemetry/sdk-metrics/build/src/types.js'

/**
 * A metric reader that can be invoked manually with `collect()` to obtain its metrics.
 */
export class ManualMetricReader extends MetricReader {
  override async collect(options?: CommonReaderOptions | undefined): Promise<CollectionResult> {
    return await super.collect(options)
  }

  protected override async onShutdown(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  protected override async onForceFlush(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
