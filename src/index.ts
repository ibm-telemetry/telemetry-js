#!/usr/bin/env node
/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getGitOrigin } from './main/core/get-git-origin.js'
import { initializeOpenTelemetry } from './main/core/initialize-open-telemetry.js'
import * as ResourceAttributes from './main/core/resource-attributes.js'
import { getPackageName } from './main/scopes/npm/get-package-name.js'
import { getPackageVersion } from './main/scopes/npm/get-package-version.js'

/*

1. read command line arguments
2. do config file stuff
3. do a bunch of open telemetry setup stuff
4. create a bunch of scopes
5. run the scopes
6. gather data
7. send data

*/

export async function run() {
  const date = new Date().toISOString()

  // parseConfigFile()
  const config = {
    projectId: 'abecafa7681dfd65cc'
  }

  const packageJsonInfo = {
    name: getPackageName(),
    version: getPackageVersion()
  }

  const gitOrigin = getGitOrigin()

  const { metricReader } = initializeOpenTelemetry({
    [ResourceAttributes.EMITTER_NAME]: packageJsonInfo.name,
    [ResourceAttributes.EMITTER_VERSION]: packageJsonInfo.version,
    [ResourceAttributes.PROJECT_ID]: config.projectId,
    [ResourceAttributes.ANALYZED_RAW]: gitOrigin.raw,
    [ResourceAttributes.ANALYZED_HOST]: gitOrigin.host,
    [ResourceAttributes.ANALYZED_OWNER]: gitOrigin.owner,
    [ResourceAttributes.ANALYZED_REPOSITORY]: gitOrigin.repository,
    [ResourceAttributes.DATE]: date
  })

  const results = await metricReader.collect()

  // TODO: remove this test line
  console.log(JSON.stringify(results, null, 2))
}

await run()
