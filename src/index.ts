#!/usr/bin/env node
/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { tmpName } from 'tmp-promise'

import { exec } from './main/core/exec.js'
import { initializeOpenTelemetry } from './main/core/initialize-open-telemetry.js'
import { Logger } from './main/core/logger.js'
import * as ResourceAttributes from './main/core/resource-attributes.js'
import { tokenizeRepository } from './main/core/tokenize-repository.js'
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

async function run() {
  const date = new Date().toISOString()
  const logFilePath = await tmpName({
    template: `ibmtelemetrics-${date.replace(/[:.-]/g, '')}-XXXXXX.log`
  })

  const logger = new Logger(logFilePath)

  // TODO: remove this test code
  await logger.log('debug', 'hello world')
  await logger.log('error', new Error('wow cool'))

  // parseConfigFile()
  const config = {
    projectId: 'abecafa7681dfd65cc'
  }

  const packageJsonInfo = {
    name: getPackageName(),
    version: getPackageVersion()
  }

  // TODO: handle non-existant remote
  // TODO: move this logic elsewhere
  const gitOrigin = exec('git remote get-url origin')
  const repository = tokenizeRepository(gitOrigin)

  const { metricReader } = initializeOpenTelemetry({
    [ResourceAttributes.EMITTER_NAME]: packageJsonInfo.name,
    [ResourceAttributes.EMITTER_VERSION]: packageJsonInfo.version,
    [ResourceAttributes.PROJECT_ID]: config.projectId,
    [ResourceAttributes.ANALYZED_RAW]: gitOrigin,
    [ResourceAttributes.ANALYZED_HOST]: repository.host,
    [ResourceAttributes.ANALYZED_OWNER]: repository.owner,
    [ResourceAttributes.ANALYZED_REPOSITORY]: repository.repository,
    [ResourceAttributes.DATE]: date
  })

  const results = await metricReader.collect()

  // TODO: remove this test line
  console.log(JSON.stringify(results, null, 2))
}

await run()
