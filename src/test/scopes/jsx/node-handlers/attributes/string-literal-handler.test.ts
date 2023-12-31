/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { StringLiteralHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/string-literal-handler.js'
import { getTrackedSourceFiles } from '../../../../../main/scopes/jsx/utils/get-tracked-source-files.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('stringLiteralHandler', () => {
  const logger = initLogger()

  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile

    const handler = new StringLiteralHandler(sourceFile, logger)
    const nodes = findNodesByType(sourceFile, ts.SyntaxKind.StringLiteral, (node) => {
      return node.parent.kind === ts.SyntaxKind.JsxAttribute
    })

    expect(handler.getData(nodes[0] as ts.StringLiteral)).toBe('firstPropValue')
    expect(handler.getData(nodes[1] as ts.StringLiteral)).toBe('stringPropValue')
    expect(handler.getData(nodes[2] as ts.StringLiteral)).toBe('secondStringPropValue')
    expect(nodes).toHaveLength(3)
  })
})
