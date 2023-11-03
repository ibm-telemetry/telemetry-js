/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { IdentifierHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/identifier-handler.js'
import { Fixture } from '../../../../__utils/fixture.js'

describe('identifierHandler', () => {
  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/simple.tsx')
    const program = ts.createProgram([fixture.path], { })
    const sourceFiles = program.getSourceFiles().filter((file) => !file.isDeclarationFile)

    const sourceFile = sourceFiles[0]
    // TODOASKJOE
    const identifierElement = ((sourceFile?.statements[1] as ts.VariableStatement).declarationList.declarations[0]?.initializer as ts.JsxElement).openingElement.tagName

    const handler = new IdentifierHandler(sourceFile as ts.SourceFile)

    expect(handler.getData(identifierElement as ts.Identifier)).toStrictEqual('Button')
  })
})
