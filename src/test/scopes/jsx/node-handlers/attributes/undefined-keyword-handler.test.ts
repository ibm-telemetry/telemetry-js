/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { UndefinedKeywordHandler } from '../../../../../main/scopes/jsx/node-handlers/attributes/undefined-keyword-handler.js'
import { Fixture } from '../../../../__utils/fixture.js'

describe('undefinedKeywordHandler', () => {
  it('correctly returns node text', async () => {
    const fixture = new Fixture('jsx-samples/simple.tsx')
    const program = ts.createProgram([fixture.path], {})
    const sourceFiles = program.getSourceFiles().filter((file) => !file.isDeclarationFile)

    const sourceFile = sourceFiles[0]
    const handler = new UndefinedKeywordHandler(sourceFile as ts.SourceFile)

    expect(handler.getData(sourceFile as ts.Node)).toStrictEqual('undefined')
  })
})
