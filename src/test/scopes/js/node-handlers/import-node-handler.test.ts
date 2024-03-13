/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ts = require('typescript')
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../main/core/get-tracked-source-files.js'
import { ImportNodeHandler } from '../../../../main/scopes/js/node-handlers/import-node-handler.js'
import { JsxElementAccumulator } from '../../../../main/scopes/jsx/jsx-element-accumulator.js'
import { JsxScope } from '../../../../main/scopes/jsx/jsx-scope.js'
import { findNodesByType } from '../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../__utils/fixture.js'
import { initLogger } from '../../../__utils/init-logger.js'

describe('class: ImportNodeHandler', async () => {
  const logger = initLogger()
  const fixture = new Fixture('jsx-samples/all-import-types.tsx')
  const sourceFile = (
    await getTrackedSourceFiles(fixture.path, logger, JsxScope.fileExtensions)
  )[0] as ts.SourceFile
  const accumulator = new JsxElementAccumulator()
  const handler = new ImportNodeHandler(sourceFile, logger)
  it('correctly returns the JsxImports for a complex fixture', () => {
    const importDeclarations = findNodesByType(sourceFile, ts.SyntaxKind.ImportDeclaration)

    importDeclarations.forEach((importDeclaration) => {
      handler.handle(importDeclaration as ts.ImportDeclaration, accumulator)
    })

    expect(accumulator.imports).toMatchSnapshot()
  })
})
