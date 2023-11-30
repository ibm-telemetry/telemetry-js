/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { ComplexAttribute } from '../../../../../main/scopes/jsx/complex-attribute.js'
import { IdentifierHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/identifier-handler.js'
import { getTrackedSourceFiles } from '../../../../../main/scopes/jsx/utils/get-tracked-source-files.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('identifierHandler', () => {
  const logger = initLogger()

  it('correctly returns undefined for undefined attribute value', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile

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
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile

    const handler = new IdentifierHandler(sourceFile, logger)

    expect(
      handler.getData(
        findNodesByType(sourceFile, ts.SyntaxKind.Identifier, (node) => {
          return node.parent.getChildAt(0).getText(sourceFile) === 'identifierProp'
        })[0] as ts.Identifier
      )
    ).toStrictEqual(new ComplexAttribute('identifierProp'))
  })
})
