/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { initializeOpenTelemetry } from '../../main/core/initialize-open-telemetry.js'
import * as ResourceAttributes from '../../main/core/resource-attributes.js'

/**
 * Initializes the OpenTelemetry package with test values.
 *
 * @returns The metric reader returned by initializeOpenTelemetry.
 */
export function initializeOtelForTest() {
  const date = new Date(2023).toISOString()

  return initializeOpenTelemetry({
    [ResourceAttributes.EMITTER_NAME]: 'telemetryName',
    [ResourceAttributes.EMITTER_VERSION]: 'telemetryVersion',
    [ResourceAttributes.PROJECT_ID]: 'projectId',
    [ResourceAttributes.ANALYZED_RAW]: 'gitOrigin',
    [ResourceAttributes.ANALYZED_HOST]: 'host',
    [ResourceAttributes.ANALYZED_OWNER]: 'owner',
    [ResourceAttributes.ANALYZED_REPOSITORY]: 'repository',
    [ResourceAttributes.DATE]: date
  })
}
