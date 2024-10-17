/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CustomResourceAttributes } from '@ibm/telemetry-attributes-js'

import { OpenTelemetryContext } from '../../main/core/open-telemetry-context.js'

/**
 * Initializes the OpenTelemetry package with test values.
 *
 * @returns The metric reader returned by initializeOpenTelemetry.
 */
export function initializeOtelForTest() {
  const date = new Date(2023).toISOString()

  // Force re-initialization on next use
  const otelContext = OpenTelemetryContext.getInstance(true)

  otelContext.setAttributes({
    [CustomResourceAttributes.TELEMETRY_EMITTER_NAME]: 'telemetryName',
    [CustomResourceAttributes.TELEMETRY_EMITTER_VERSION]: 'telemetryVersion',
    [CustomResourceAttributes.PROJECT_ID]: 'projectId',
    [CustomResourceAttributes.ANALYZED_HOST]: 'host',
    [CustomResourceAttributes.ANALYZED_OWNER]: 'owner',
    [CustomResourceAttributes.ANALYZED_PATH]: 'host/owner/repository',
    [CustomResourceAttributes.ANALYZED_OWNER_PATH]: 'host/owner',
    [CustomResourceAttributes.ANALYZED_REPOSITORY]: 'repository',
    [CustomResourceAttributes.ANALYZED_COMMIT]: 'commitHash',
    [CustomResourceAttributes.ANALYZED_REFS]: [],
    [CustomResourceAttributes.DATE]: date
  })

  return otelContext
}
