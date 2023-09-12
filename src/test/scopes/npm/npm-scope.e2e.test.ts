/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest'

import { createLogFilePath } from '../../../main/core/log/create-log-file-path.js'
import { Logger } from '../../../main/core/log/logger.js'
import { NpmScope } from '../../../main/scopes/npm/npm-scope.js'
import { Fixture } from '../../__utils/fixture.js'
import { initializeOtelForTest } from '../../__utils/initialize-otel-for-test.js'

const logger = new Logger(await createLogFilePath(new Date().toISOString()))

describe('npmScope', () => {
  it('correctly captures dependency data', async () => {
    const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
    const scope = new NpmScope(fixture.path, logger)

    const metricReader = initializeOtelForTest()

    await scope.run()

    const results = await metricReader.collect()

    expect(results).toMatchSnapshot()
  })
})
