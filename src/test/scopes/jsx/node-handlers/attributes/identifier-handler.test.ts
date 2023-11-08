/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { IdentifierHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/identifier-handler.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('identifierHandler', () => {
  const logger = initLogger()

  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/simple.tsx')
    const program = ts.createProgram([fixture.path], {})
    const sourceFiles = program.getSourceFiles().filter((file) => !file.isDeclarationFile)

    const sourceFile = sourceFiles[0] as ts.SourceFile

    const handler = new IdentifierHandler(sourceFile, logger)

    expect(
      handler.getData(findNodesByType(sourceFile, ts.SyntaxKind.Identifier)[0] as ts.Identifier)
    ).toStrictEqual('Button')
  })
})
