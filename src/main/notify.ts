/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Environment } from './core/environment.js'

function notify() {
  const environment = new Environment()
  if (environment.isCI && environment.isTelemetryEnabled) {
    console.log(`
--------------------------------------------------------------------------------
NOTICE:
A package you installed is using IBM Telemetry to collect anonymous usage data.
This information is used to influence the project's roadmap and prioritize bug
fixes.

You can opt-out of this process by setting IBM_TELEMETRY_DISABLED='true' in your
environment.

To learn more, please visit: https://github.com/ibm-telemetry/telemetry-js'
--------------------------------------------------------------------------------
`)
  }
}

export { notify }
