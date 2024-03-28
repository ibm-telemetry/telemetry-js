/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { ComplexValue } from '../../../../../main/scopes/js/complex-value.js'
import { JsFunctionTokenAccumulator } from '../../../../../main/scopes/js/js-function-token-accumulator.js'
// eslint-disable-next-line max-len -- It's a long import
import { AccessExpressionNodeHandler } from '../../../../../main/scopes/js/node-handlers/tokens-and-functions-handlers/access-expression-node-handler.js'
import { createSourceFileFromText } from '../../../../__utils/create-source-file-from-text.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: AccessExpressionNodeHandler', async () => {
  const logger = initLogger()

  describe('kind: ElementAccessExpression', () => {
    it('captures a basic token usage by element access', () => {
      const sourceFile = createSourceFileFromText('foo["bar"]')
      const nodes = findNodesByType<ts.ElementAccessExpression>(
        sourceFile,
        ts.SyntaxKind.ElementAccessExpression
      )
      const accumulator = new JsFunctionTokenAccumulator()
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(1)
      expect(accumulator.tokens[0]).toStrictEqual({
        name: 'foo["bar"]',
        accessPath: ['foo', 'bar'],
        startPos: 0,
        endPos: 10
      })
    })

    it('does not capture a token inside of a call expression', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo["bar"]["baz"]()')
      const nodes = findNodesByType<ts.ElementAccessExpression>(
        sourceFile,
        ts.SyntaxKind.ElementAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(0)
    })

    it('does not capture a token for an identifier', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo')
      const nodes = findNodesByType<ts.ElementAccessExpression>(
        sourceFile,
        ts.SyntaxKind.ElementAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(0)
    })

    it('does not capture a token for a property access expression', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('bar["asdf"].foo')
      const nodes = findNodesByType<ts.ElementAccessExpression>(
        sourceFile,
        ts.SyntaxKind.ElementAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(0)
    })

    it('captures a token when accessor is a chain that ends with an element', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo.bar["asdf"]')
      const nodes = findNodesByType<ts.ElementAccessExpression>(
        sourceFile,
        ts.SyntaxKind.ElementAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(1)
      expect(accumulator.tokens[0]).toMatchObject({
        name: 'foo.bar["asdf"]',
        accessPath: ['foo', 'bar', 'asdf']
      })
    })

    it('does not capture a token for a function invocation', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo()')
      const nodes = findNodesByType<ts.ElementAccessExpression>(
        sourceFile,
        ts.SyntaxKind.ElementAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(0)
    })

    it('captures token when used as complex element accessor', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo[ACCESS_TOKEN["bla"]].baz()')
      const nodes = findNodesByType<ts.ElementAccessExpression>(
        sourceFile,
        ts.SyntaxKind.ElementAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(1)
      expect(accumulator.tokens[0]).toMatchObject({
        name: 'ACCESS_TOKEN["bla"]',
        accessPath: ['ACCESS_TOKEN', 'bla']
      })
    })

    it('captures token when used as complex element accessor', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo[ACCESS_TOKEN["bla"]]')
      const nodes = findNodesByType<ts.ElementAccessExpression>(
        sourceFile,
        ts.SyntaxKind.ElementAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(2)
      expect(accumulator.tokens[0]).toMatchObject({
        name: 'foo[ACCESS_TOKEN["bla"]]',
        accessPath: ['foo', new ComplexValue('ACCESS_TOKEN["bla"]')]
      })
      expect(accumulator.tokens[1]).toMatchObject({
        name: 'ACCESS_TOKEN["bla"]',
        accessPath: ['ACCESS_TOKEN', 'bla']
      })
    })
  })

  describe('kind: PropertyAccessExpression', async () => {
    const logger = initLogger()

    it('captures a basic token usage by property access', () => {
      const sourceFile = createSourceFileFromText('foo.bar.baz')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const accumulator = new JsFunctionTokenAccumulator()
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(1)
      expect(accumulator.tokens[0]).toMatchObject({
        name: 'foo.bar.baz',
        accessPath: ['foo', 'bar', 'baz']
      })
    })

    it('does not capture a token inside of a call expression', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo.bar.baz()')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(0)
    })

    it('does not capture a token for an identifier', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(0)
    })

    it('does not capture a token for an element access expression', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo.bar["asdf"]')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(0)
    })

    it('captures a token when accessor is a chain that ends with a property', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo["asdf"].bar')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(1)
      expect(accumulator.tokens[0]).toMatchObject({
        name: 'foo["asdf"].bar',
        accessPath: ['foo', 'asdf', 'bar']
      })
    })

    it('does not capture a token for a function invocation', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo()')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(0)
    })

    it('does not capture a token for a property accessed off of a function call', () => {
      // This is captured at this point, but will be filtered later on because:
      // foo().bar <-- don't collect because if foo() returns something from a user, then .bar is
      // potentially private information
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo().bar')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(1)
      expect(accumulator.tokens[0]).toMatchObject({
        name: 'foo().bar',
        accessPath: ['foo', 'bar']
      })
    })

    it('captures token when used as complex element accessor', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo[ACCESS_TOKEN["bla"]].baz')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(1)
      expect(accumulator.tokens[0]).toMatchObject({
        name: 'foo[ACCESS_TOKEN["bla"]].baz',
        accessPath: ['foo', new ComplexValue('ACCESS_TOKEN["bla"]'), 'baz']
      })
    })

    it('captures token when used as complex element accessor', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      const sourceFile = createSourceFileFromText('foo[nested.property]')
      const nodes = findNodesByType<ts.PropertyAccessExpression>(
        sourceFile,
        ts.SyntaxKind.PropertyAccessExpression
      )
      const handler = new AccessExpressionNodeHandler(sourceFile, logger)

      nodes.forEach((node) => {
        handler.handle(node, accumulator)
      })

      expect(accumulator.tokens).toHaveLength(1)
      expect(accumulator.tokens[0]).toMatchObject({
        name: 'nested.property',
        accessPath: ['nested', 'property']
      })
    })
  })
})
