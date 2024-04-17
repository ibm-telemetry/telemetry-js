/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../../main/core/get-tracked-source-files.js'
import { ComplexValue } from '../../../../../main/scopes/js/complex-value.js'
import { IdentifierHandler } from '../../../../../main/scopes/js/node-handlers/value-handlers/identifier-handler.js'
import { JsxScope } from '../../../../../main/scopes/jsx/jsx-scope.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('identifierHandler', () => {
  const logger = initLogger()

  it('correctly returns undefined for undefined attribute value', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (await (
      await getTrackedSourceFiles(fixture.path, fixture.path, logger, JsxScope.fileExtensions)
    )[0]?.createSourceFile()) as ts.SourceFile

    const handler = new IdentifierHandler(sourceFile, logger)

    expect(
      handler.getData(
        findNodesByType(sourceFile, ts.SyntaxKind.Identifier, (node) => {
          return node.parent.kind === ts.SyntaxKind.JsxExpression
        })[0] as ts.Identifier
      )
    ).toBeUndefined()
  })

  it('correctly returns complex attribute', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (await (
      await getTrackedSourceFiles(fixture.path, fixture.path, logger, JsxScope.fileExtensions)
    )[0]?.createSourceFile()) as ts.SourceFile

    const handler = new IdentifierHandler(sourceFile, logger)

    expect(
      handler.getData(
        findNodesByType(sourceFile, ts.SyntaxKind.Identifier, (node) => {
          return node.parent.getChildAt(0).getText(sourceFile) === 'identifierProp'
        })[0] as ts.Identifier
      )
    ).toStrictEqual(new ComplexValue('identifierProp'))
  })
})
