/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as packageInfo from '../package.json'
import { initializeOpenTelemetry } from './main/core/instrumentation.js'
import * as ResourceAttributes from './main/core/resource-attributes.js'

/*

1. read command line arguments
2. do config file stuff
3. do a bunch of open telemetry setup stuff
4. create a bunch of scopes
5. run the scopes
6. gather data
7. send data

*/

const date = new Date().toISOString()

// parseConfigFile()
const config = {
  projectId: 'abecafa7681dfd65cc'
}

const gitInfo = {
  remote: 'https://example.com/example-org/example-repo'
}

initializeOpenTelemetry({
  [ResourceAttributes.EMITTER_NAME]: packageInfo.default.name,
  [ResourceAttributes.EMITTER_VERSION]: packageInfo.default.version,
  [ResourceAttributes.PROJECT_ID]: config.projectId,
  [ResourceAttributes.ANALYZED_RAW]: gitInfo.remote,
  [ResourceAttributes.ANALYZED_HOST]: 'example.com',
  [ResourceAttributes.ANALYZED_OWNER]: 'example-org',
  [ResourceAttributes.ANALYZED_REPOSITORY]: 'example-repo',
  [ResourceAttributes.DATE]: date
})
