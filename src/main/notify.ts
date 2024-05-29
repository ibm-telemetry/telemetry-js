import { Environment } from './core/environment.js'

/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
function notify() {
  const env = new Environment()
  if (env.isCI && env.isTelemetryEnabled) {
    console.log(
      '--------------------------------------------------------------------------------\n' +
        'NOTICE: ' +
        'A package you installed is using IBM Telemetry to collect anonymous usage data. ' +
        "This information is used to influence the project's roadmap and prioritize bug fixes." +
        ' \n\nYou can opt-out of this process by setting ' +
        "IBM_TELEMETRY_DISABLED='true'" +
        ' in your environment.' +
        '\n\nTo learn more, please visit: ' +
        'https://github.com/ibm-telemetry/telemetry-js' +
        '.\n' +
        '--------------------------------------------------------------------------------\n'
    )
  }
}

export { notify }
