/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type CollectionResult } from '@opentelemetry/sdk-metrics'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

/**
 * Metric timestamps change every run. This function changes them to a fixed value  of zero.
 *
 * @param results - The collection results to consider.
 */
export function clearTelemetrySdkVersion(results: CollectionResult) {
  results.resourceMetrics.resource.attributes[
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- For snapshot comparisons
    SemanticResourceAttributes.TELEMETRY_SDK_VERSION
  ] = '[omitted for test snapshot]'
}
