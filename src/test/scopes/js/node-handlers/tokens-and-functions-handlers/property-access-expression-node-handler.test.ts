/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { JsFunctionTokenAccumulator } from '../../../../../main/scopes/js/js-function-token-accumulator.js'
// eslint-disable-next-line max-len -- It's a long import
import { PropertyAccessExpressionNodeHandler } from '../../../../../main/scopes/js/node-handlers/tokens-and-functions-handlers/property-access-expression-node-handler.js'
import { createSourceFileFromText } from '../../../../__utils/create-source-file-from-text.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { initLogger } from '../../../../__utils/init-logger.js'

function findNodes(file: ts.SourceFile) {
  return findNodesByType(
    file,
    ts.SyntaxKind.PropertyAccessExpression
  ) as ts.PropertyAccessExpression[]
}

describe('class: PropertyAccessExpressionNodeHandler', async () => {
  const logger = initLogger()

  it('captures a basic token usage by property access', () => {
    const sourceFile = createSourceFileFromText('foo.bar.baz')
    const nodes = findNodes(sourceFile)
    const accumulator = new JsFunctionTokenAccumulator()
    const handler = new PropertyAccessExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(1)
    expect(accumulator.tokens[0]).toMatchObject({
      name: 'foo.bar.baz'
    })
  })

  it('does not capture a token metric inside of a call expression', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo.bar.baz()')
    const nodes = findNodes(sourceFile)
    const handler = new PropertyAccessExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(0)
  })

  it('does not capture a token metric inside of a call expression', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo')
    const nodes = findNodes(sourceFile)
    const handler = new PropertyAccessExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(0)
  })

  it('todo', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo["asdf"]')
    const nodes = findNodes(sourceFile)
    const handler = new PropertyAccessExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(0)
  })


  it('todo', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo["asdf"].bar')
    const nodes = findNodes(sourceFile)
    const handler = new PropertyAccessExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(1)
    expect(accumulator.tokens[0]).toMatchObject({
      name: 'foo["asdf"].bar'
    })
  })

  it('todo', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo()')
    const nodes = findNodes(sourceFile)
    const handler = new PropertyAccessExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.tokens).toHaveLength(0)
  })
})
