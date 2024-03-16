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
import { CallExpressionNodeHandler } from '../../../../../main/scopes/js/node-handlers/tokens-and-functions-handlers/call-expression-node-handler.js'
import { JsxScope } from '../../../../../main/scopes/jsx/jsx-scope.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: CallExpressionNodeHandler', async () => {
  const logger = initLogger()
  const fixture = new Fixture('js-samples/all-js-function-types.tsx')
  const sourceFile = (
    await getTrackedSourceFiles(fixture.path, logger, JsxScope.fileExtensions)
  )[0] as ts.SourceFile
  const handler = new CallExpressionNodeHandler(sourceFile, logger)
  it('correctly returns the JsFunctions for a complex fixture', async () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const callExpressions = findNodesByType(sourceFile, ts.SyntaxKind.CallExpression)

    callExpressions.forEach((callExpression) => {
      handler.handle(callExpression as ts.CallExpression, accumulator)
    })

    expect(accumulator.functions).toMatchSnapshot()
  })

  it('does not capture JsFunctions if they have already been captured', async () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const callExpressions = findNodesByType(sourceFile, ts.SyntaxKind.CallExpression)

    callExpressions.forEach((callExpression) => {
      handler.handle(callExpression as ts.CallExpression, accumulator)
    })

    expect(accumulator.functions).toHaveLength(8)

    callExpressions.forEach((callExpression) => {
      handler.handle(callExpression as ts.CallExpression, accumulator)
    })

    expect(accumulator.functions).toHaveLength(8)
  })
})
