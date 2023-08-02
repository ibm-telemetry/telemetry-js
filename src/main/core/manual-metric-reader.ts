/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { MetricReader } from '@opentelemetry/sdk-metrics'

/**
 * A metric reader that can be invoked manually with `collect()` to obtain its metrics.
 */
export class ManualMetricReader extends MetricReader {
  protected async onShutdown(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  protected async onForceFlush(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
