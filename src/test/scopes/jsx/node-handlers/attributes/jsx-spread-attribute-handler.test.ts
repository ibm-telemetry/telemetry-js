/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../../main/scopes/jsx/get-tracked-source-files.js'
import { JsxSpreadAttributeHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/jsx-spread-attribute-handler.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: JsxSpreadAttributeHandler', () => {
  const logger = initLogger()
  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/jsx-elements.tsx')
    const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile
    const handler = new JsxSpreadAttributeHandler(sourceFile, logger)

    expect(
      handler.getData(
        findNodesByType(sourceFile, ts.SyntaxKind.JsxSpreadAttribute)[0] as ts.JsxSpreadAttribute
      )
    ).toStrictEqual('{...spreadObj}')
  })
})
