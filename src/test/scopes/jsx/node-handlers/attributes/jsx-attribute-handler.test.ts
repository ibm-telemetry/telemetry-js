/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { NoAttributeInitializerFoundError } from '../../../../../main/exceptions/no-attribute-initializer-found-error.js'
import { getTrackedSourceFiles } from '../../../../../main/scopes/jsx/get-tracked-source-files.js'
import { JsxAttributeHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/jsx-attribute-handler.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: JsxAttributeHandler', () => {
  const logger = initLogger()
  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/simple.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile
    const handler = new JsxAttributeHandler(sourceFile, logger)

    expect(
      handler.getData(findNodesByType(sourceFile, ts.SyntaxKind.JsxAttribute)[0] as ts.JsxAttribute)
    ).toStrictEqual("1 === 5 ? 'boo' : 'baa'")
  })
  it('throws NoAttributeInitializerFoundError if attribute does not have an initializer', async () => {
    const fixture = new Fixture('jsx-samples/jsx-elements.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile
    const handler = new JsxAttributeHandler(sourceFile, logger)

    const node = findNodesByType(
      sourceFile,
      ts.SyntaxKind.JsxAttribute,
      (node) => (node as ts.JsxAttribute).initializer === undefined
    )[0]

    expect(() => handler.getData(node as ts.JsxAttribute)).toThrow(NoAttributeInitializerFoundError)
  })
})
