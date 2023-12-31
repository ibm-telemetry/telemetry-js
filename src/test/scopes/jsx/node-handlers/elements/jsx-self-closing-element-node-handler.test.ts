/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { JsxElementAccumulator } from '../../../../../main/scopes/jsx/jsx-element-accumulator.js'
import { JsxSelfClosingElementNodeHandler } from '../../../../../main/scopes/jsx/node-handlers/elements/jsx-self-closing-element-node-handler.js'
import { getTrackedSourceFiles } from '../../../../../main/scopes/jsx/utils/get-tracked-source-files.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: JsxSelfClosingElementNodeHandler', async () => {
  const logger = initLogger()
  const fixture = new Fixture('jsx-samples/all-jsx-element-types.tsx')
  const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile
  const accumulator = new JsxElementAccumulator()
  const handler = new JsxSelfClosingElementNodeHandler(sourceFile, logger)

  it('correctly returns the JsxElements for a complex fixture', async () => {
    const jsxSelfClosingElements = findNodesByType(sourceFile, ts.SyntaxKind.JsxSelfClosingElement)

    jsxSelfClosingElements.forEach((jsxSelfClosingElement) => {
      handler.handle(jsxSelfClosingElement as ts.JsxSelfClosingElement, accumulator)
    })

    expect(accumulator.elements).toMatchSnapshot()
  })
})
