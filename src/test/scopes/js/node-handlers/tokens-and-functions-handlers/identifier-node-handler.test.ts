/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../../main/core/get-tracked-source-files.js'
import { JsFunctionTokenAccumulator } from '../../../../../main/scopes/js/js-function-token-accumulator.js'
import { JsScope } from '../../../../../main/scopes/js/js-scope.js'
import { IdentifierNodeHandler } from '../../../../../main/scopes/js/node-handlers/tokens-and-functions-handlers/identifier-node-handler.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: IdentifierNodeHandler', async () => {
  const logger = initLogger()
  const fixture = new Fixture('js-samples/all-js-token-types.ts')
  const sourceFile = (
    await getTrackedSourceFiles(fixture.path, logger, JsScope.fileExtensions)
  )[0] as ts.SourceFile

  const handler = new IdentifierNodeHandler(sourceFile, logger)

  it('correctly returns the JsTokens for a complex fixture', async () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const identifiers = findNodesByType(sourceFile, ts.SyntaxKind.Identifier)

    identifiers.forEach((identifier) => {
      handler.handle(identifier as ts.Identifier, accumulator)
    })

    expect(accumulator.tokens).toMatchSnapshot()
  })
})
