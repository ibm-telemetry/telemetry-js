/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../../main/core/get-tracked-source-files.js'
import { TrueKeywordHandler } from '../../../../../main/scopes/js/node-handlers/value-handlers/true-keyword-handler.js'
import { JsxScope } from '../../../../../main/scopes/jsx/jsx-scope.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('trueKeywordHandler', () => {
  const logger = initLogger()

  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (await (
      await getTrackedSourceFiles(fixture.path, fixture.path, logger, JsxScope.fileExtensions)
    )[0]?.createSourceFile()) as ts.SourceFile

    const handler = new TrueKeywordHandler(sourceFile, logger)

    // eslint-disable-next-line vitest/prefer-to-be-truthy -- we want strict true comparison
    expect(handler.getData(sourceFile as ts.Node)).toBe(true)
  })
})
