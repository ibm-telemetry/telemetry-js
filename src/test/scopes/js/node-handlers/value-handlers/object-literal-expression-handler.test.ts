/*
 * Copyright IBM Corp. 2026, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright IBM Corp. 2026, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../../main/core/get-tracked-source-files.js'
import { ComplexValue } from '../../../../../main/scopes/js/complex-value.js'
import { ObjectLiteralExpressionHandler } from '../../../../../main/scopes/js/node-handlers/value-handlers/object-literal-expression-handler.js'
import { JsxScope } from '../../../../../main/scopes/jsx/jsx-scope.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('ObjectLiteralExpressionHandler', () => {
  const logger = initLogger()

  it('parses a flat object literal into a ComplexValue wrapping a record', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (await (
      await getTrackedSourceFiles(fixture.path, fixture.path, logger, JsxScope.fileExtensions)
    )[0]?.createSourceFile()) as ts.SourceFile

    const handler = new ObjectLiteralExpressionHandler(sourceFile, logger)

    // Find the ObjectLiteralExpression that is the initializer of `objectLiteralProp`
    const objectNode = findNodesByType<ts.ObjectLiteralExpression>(
      sourceFile,
      ts.SyntaxKind.ObjectLiteralExpression,
      (node) => node.parent?.parent?.getChildAt(0).getText(sourceFile) === 'objectLiteralProp'
    )[0] as ts.ObjectLiteralExpression

    const result = handler.getData(objectNode)

    expect(result).toBeInstanceOf(ComplexValue)
    expect(result.complexValue).toStrictEqual({ key: 'value' })
  })

  it('returns an empty record for an empty object literal', () => {
    // Build a minimal source file with an empty object literal
    const emptyObjSource = ts.createSourceFile(
      'empty.tsx',
      'const x = {}',
      ts.ScriptTarget.ES2021,
      true
    )
    const handler = new ObjectLiteralExpressionHandler(emptyObjSource, logger)
    const objectNodes = findNodesByType<ts.ObjectLiteralExpression>(
      emptyObjSource,
      ts.SyntaxKind.ObjectLiteralExpression
    )

    const result = handler.getData(objectNodes[0] as ts.ObjectLiteralExpression)

    expect(result).toBeInstanceOf(ComplexValue)
    expect(result.complexValue).toStrictEqual({})
  })
})
