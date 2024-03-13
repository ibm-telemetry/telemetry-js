/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ts = require('typescript')
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../../main/core/get-tracked-source-files.js'
import { JsxAttributeHandler } from '../../../../../main/scopes/js/node-handlers/value-handlers/jsx-attribute-handler.js'
import { JsxScope } from '../../../../../main/scopes/jsx/jsx-scope.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: JsxAttributeHandler', () => {
  const logger = initLogger()
  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/all-attr-types.tsx')
    const sourceFile = (
      await getTrackedSourceFiles(fixture.path, logger, JsxScope.fileExtensions)
    )[0] as ts.SourceFile
    const handler = new JsxAttributeHandler(sourceFile, logger)
    const nodes = findNodesByType(sourceFile, ts.SyntaxKind.JsxAttribute)

    nodes.forEach((node) => {
      expect(() => handler.getData(node as ts.JsxAttribute)).not.toThrow()
    })
  })
})
