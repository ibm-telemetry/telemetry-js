/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { NoAttributeExpressionFoundError } from '../../../../../main/exceptions/no-attribute-expression-found-error.js'
import { getTrackedSourceFiles } from '../../../../../main/scopes/jsx/get-tracked-source-files.js'
import { JsxExpressionHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/jsx-expression-handler.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: JsxExpressionHandler', () => {
  const logger = initLogger()
  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/simple.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile
    const handler = new JsxExpressionHandler(sourceFile, logger)

    expect(
      handler.getData(
        findNodesByType(sourceFile, ts.SyntaxKind.JsxExpression)[0] as ts.JsxExpression
      )
    ).toStrictEqual("1 === 5 ? 'boo' : 'baa'")
  })
  it('throws NoAttributeExpressionFoundError if attribute does not have an expression', async () => {
    const fixture = new Fixture('jsx-samples/jsx-elements.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile
    const handler = new JsxExpressionHandler(sourceFile, logger)

    const node = findNodesByType(
      sourceFile,
      ts.SyntaxKind.JsxExpression,
      (node) => (node as ts.JsxExpression).expression === undefined
    )[0]

    expect(() => handler.getData(node as ts.JsxExpression)).toThrow(NoAttributeExpressionFoundError)
  })
})
