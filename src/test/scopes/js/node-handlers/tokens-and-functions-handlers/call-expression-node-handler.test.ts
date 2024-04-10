/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { ComplexValue } from '../../../../../main/scopes/js/complex-value.js'
import { JsFunctionTokenAccumulator } from '../../../../../main/scopes/js/js-function-token-accumulator.js'
// eslint-disable-next-line max-len -- It's a long import
import { CallExpressionNodeHandler } from '../../../../../main/scopes/js/node-handlers/tokens-and-functions-handlers/call-expression-node-handler.js'
import { createSourceFileFromText } from '../../../../__utils/create-source-file-from-text.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: CallExpressionExpressionNodeHandler', async () => {
  const logger = initLogger()

  it('captures function at the end of a property chain', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo.bar.baz()')
    const nodes = findNodesByType<ts.CallExpression>(sourceFile, ts.SyntaxKind.CallExpression)
    const handler = new CallExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.functions).toHaveLength(1)
    expect(accumulator.functions[0]).toStrictEqual({
      name: 'foo.bar.baz',
      arguments: [],
      accessPath: ['foo', 'bar', 'baz'],
      startPos: 0,
      endPos: 13
    })
  })

  it('captures function at the end of a property chain', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo[ACCESS_TOKEN["bla"]].baz()')
    const nodes = findNodesByType<ts.CallExpression>(sourceFile, ts.SyntaxKind.CallExpression)
    const handler = new CallExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.functions).toHaveLength(1)
    expect(accumulator.functions[0]).toMatchObject({
      name: 'foo[ACCESS_TOKEN["bla"]].baz',
      arguments: [],
      accessPath: ['foo', new ComplexValue('ACCESS_TOKEN["bla"]'), 'baz']
    })
  })

  it('captures a function for a intermediate function', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo.bar().baz')
    const nodes = findNodesByType<ts.CallExpression>(sourceFile, ts.SyntaxKind.CallExpression)
    const handler = new CallExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.functions).toHaveLength(1)
    expect(accumulator.functions[0]).toMatchObject({
      name: 'foo.bar',
      arguments: [],
      accessPath: ['foo', 'bar']
    })
  })

  it('captures a function for a simple function', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo()')
    const nodes = findNodesByType<ts.CallExpression>(sourceFile, ts.SyntaxKind.CallExpression)
    const handler = new CallExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.functions).toHaveLength(1)
    expect(accumulator.functions[0]).toMatchObject({
      name: 'foo',
      arguments: [],
      accessPath: ['foo']
    })
  })

  it('??', () => {
    const accumulator = new JsFunctionTokenAccumulator()
    const sourceFile = createSourceFileFromText('foo().faa()')
    const nodes = findNodesByType<ts.CallExpression>(sourceFile, ts.SyntaxKind.CallExpression)
    const handler = new CallExpressionNodeHandler(sourceFile, logger)

    nodes.forEach((node) => {
      handler.handle(node, accumulator)
    })

    expect(accumulator.functions).toHaveLength(2)
    expect(accumulator.functions[1]).toMatchObject({
      name: 'foo',
      arguments: [],
      accessPath: ['foo']
    })
    expect(accumulator.functions[0]).toMatchObject({
      name: 'foo().faa',
      arguments: [],
      accessPath: ['foo', 'faa']
    })
  })

  describe('functions containing arguments', () => {
    it('captures a function and its arguments', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo(first)')
      const nodes = findNodesByType<ts.CallExpression>(sourceFile, ts.SyntaxKind.CallExpression)
      const handler = new CallExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.functions).toHaveLength(1)
      expect(accumulator.functions[0]).toMatchObject({
        name: 'foo',
        arguments: [new ComplexValue('first')],
        accessPath: ['foo']
      })
    })
  })
})
