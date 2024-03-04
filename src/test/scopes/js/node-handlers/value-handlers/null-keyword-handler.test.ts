/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { NullKeywordHandler } from '../../../../../main/scopes/js/node-handlers/value-handlers/null-keyword-handler.js'
import { getTrackedSourceFiles } from '../../../../../main/scopes/jsx/utils/get-tracked-source-files.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('nullKeywordHandler', () => {
  const logger = initLogger()

  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile

    const handler = new NullKeywordHandler(sourceFile, logger)

    expect(handler.getData(sourceFile as ts.Node)).toBeNull()
  })
})
