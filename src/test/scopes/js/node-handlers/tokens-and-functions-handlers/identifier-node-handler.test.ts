/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { JsFunctionTokenAccumulator } from '../../../../../main/scopes/js/js-function-token-accumulator.js'
import { IdentifierNodeHandler } from '../../../../../main/scopes/js/node-handlers/tokens-and-functions-handlers/identifier-node-handler.js'
import { createSourceFileFromText } from '../../../../__utils/create-source-file-from-text.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('new wow', () => {
  const logger = initLogger()

  it('captures a token for a simple identifier', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo')
    const nodes = findNodesByType<ts.Identifier>(sourceFile, ts.SyntaxKind.Identifier)
    const handler = new IdentifierNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(1)
    expect(accumulator.tokens[0]).toStrictEqual({
      name: 'foo',
      accessPath: ['foo'],
      startPos: 0,
      endPos: 3
    })
  })

  it('captures a token for a nested identifier', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo[TOKEN]')
    const nodes = findNodesByType<ts.Identifier>(sourceFile, ts.SyntaxKind.Identifier)
    const handler = new IdentifierNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(1)
    expect(accumulator.tokens[0]).toMatchObject({
      name: 'TOKEN',
      accessPath: ['TOKEN']
    })
  })

  it('does not capture a token for a string access', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo["bla"]')
    const nodes = findNodesByType<ts.Identifier>(sourceFile, ts.SyntaxKind.Identifier)
    const handler = new IdentifierNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(0)
  })

  it('does not capture any tokens for a chained property access', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo.bar.baz')
    const nodes = findNodesByType<ts.Identifier>(sourceFile, ts.SyntaxKind.Identifier)
    const handler = new IdentifierNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(0)
  })

  it('does not capture any tokens for a function + property combo', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo().bar')
    const nodes = findNodesByType<ts.Identifier>(sourceFile, ts.SyntaxKind.Identifier)
    const handler = new IdentifierNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(0)
  })
})
