/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CustomResourceAttributes } from '../../main/core/custom-resource-attributes.js'
import { OpenTelemetryContext } from '../../main/core/open-telemetry-context.js'

/**
 * Initializes the OpenTelemetry package with test values.
 *
 * @returns The metric reader returned by initializeOpenTelemetry.
 */
export function initializeOtelForTest() {
  const date = new Date(2023).toISOString()

  // Force re-initialization on next use
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- See above
  ;(OpenTelemetryContext as any).instance = undefined

  const otelContext = OpenTelemetryContext.getInstance()

  otelContext.setAttributes({
    [CustomResourceAttributes.TELEMETRY_EMITTER_NAME]: 'telemetryName',
    [CustomResourceAttributes.TELEMETRY_EMITTER_VERSION]: 'telemetryVersion',
    [CustomResourceAttributes.PROJECT_ID]: 'projectId',
    [CustomResourceAttributes.ANALYZED_RAW]: 'gitOrigin',
    [CustomResourceAttributes.ANALYZED_HOST]: 'host',
    [CustomResourceAttributes.ANALYZED_OWNER]: 'owner',
    [CustomResourceAttributes.ANALYZED_REPOSITORY]: 'repository',
    [CustomResourceAttributes.DATE]: date
  })

  return otelContext
}
