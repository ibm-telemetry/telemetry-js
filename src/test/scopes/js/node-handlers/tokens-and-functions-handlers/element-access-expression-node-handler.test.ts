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
// eslint-disable-next-line max-len -- ...
import { ElementAccessExpressionNodeHandler } from '../../../../../main/scopes/js/node-handlers/tokens-and-functions-handlers/element-access-expression-node-handler.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: ElementAccessExpressionNodeHandler', async () => {
  const logger = initLogger()
  const fixture = new Fixture('js-samples/all-js-token-types.ts')
  const sourceFile = (
    await getTrackedSourceFiles(fixture.path, logger, JsScope.fileExtensions)
  )[0] as ts.SourceFile

  const handler = new ElementAccessExpressionNodeHandler(sourceFile, logger)

  it('correctly returns the JsTokens for a complex fixture', async () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const elementAccessExpressions = findNodesByType(
      sourceFile,
      ts.SyntaxKind.ElementAccessExpression
    )

    elementAccessExpressions.forEach((elementAccessExpression) => {
      handler.handle(elementAccessExpression as ts.ElementAccessExpression, accumulator)
    })

    expect(accumulator.tokens).toMatchSnapshot()
  })
})