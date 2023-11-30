/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { FalseKeywordHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/false-keyword-handler.js'
import { getTrackedSourceFiles } from '../../../../../main/scopes/jsx/utils/get-tracked-source-files.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('falseKeywordHandler', () => {
  const logger = initLogger()

  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile

    const handler = new FalseKeywordHandler(sourceFile, logger)

    // eslint-disable-next-line vitest/prefer-to-be-falsy -- we want strict false comparison
    expect(handler.getData(sourceFile as ts.Node)).toStrictEqual(false)
  })
})
