/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { type JsxElementAttribute } from '../interfaces.js'

/**
 * Holds node handling logic to be inherited by Jsx node handlers.
 *
 */
export abstract class JsxNodeHandler {
  /**
   * Given a TagName node representing a JsxElement, obtains the name and prefix values.
   *
   * @param tagName - TagName node of JsxElement to obtain name and prefix for.
   * @returns Object containing name and prefix (as strings).
   */
  protected getElementNameAndPrefix(tagName: ts.Node) {
    // TODOASKJOE
    const tagNameAsAny = tagName as any
    let name = ''
    let prefix = null
    if (typeof tagNameAsAny.escapedText === 'string') {
      name = tagNameAsAny.escapedText
    } else {
      prefix = tagNameAsAny.expression.escapedText
      name = tagNameAsAny.name.escapedText
    }
    return { name, prefix }
  }

  /**
   * Parses JsxAttribute nodes into an array of JsxElementAttribute.
   *
   * @param attributes - JsxAttributes node to parse attributes for.
   * @returns Array of parsed attributes.
   */
  protected getElementAttributes(attributes: ts.JsxAttributes) {
    const attrs: JsxElementAttribute[] = []
    if (attributes.properties.length) {
      attributes.properties.forEach(attr => {
        let name, value
        let isVarReference = false
        let isSpread = false
        if ('name' in attr && 'escapedText' in attr.name) {
          // TODOASKJOE
          name = (attr.name.escapedText as any)
        }
        if (ts.isJsxSpreadAttribute(attr)) {
          // TODOASKJOE
          value = `...${(attr.expression as any).escapedText}`
          isSpread = true
        } else {
          if (!('initializer' in attr)) {
            isVarReference = true
            value = name ?? null
          } else {
            const initializer = attr.initializer
            if (ts.isStringLiteral(initializer)) {
              value = initializer.text
            } else if (ts.isJsxExpression(initializer)) {
              if (initializer.expression) {
                if (ts.isStringLiteral(initializer.expression)) {
                  value = initializer.expression.text
                } else if (ts.isNumericLiteral(initializer.expression)) {
                  value = Number(initializer.expression.text)
                } else if (ts.isIdentifier(initializer.expression)) {
                  isVarReference = true
                  value = (initializer.expression).escapedText
                } else if (initializer.expression.kind === ts.SyntaxKind.TrueKeyword) {
                  value = true
                } else if (initializer.expression.kind === ts.SyntaxKind.FalseKeyword) {
                  value = false
                } else if (initializer.expression.kind === ts.SyntaxKind.UndefinedKeyword) {
                  value = undefined
                } else if (initializer.expression.kind === ts.SyntaxKind.NullKeyword) {
                  value = null
                } else if (ts.isElementAccessExpression(initializer.expression)) {
                  isVarReference = true
                  // TODOASKJOE , is ts.Identifier
                  value =
                  `${(initializer.expression.expression as any).escapedText}[${(initializer.expression.argumentExpression as ts.StringLiteral).text}]`
                } else {
                  value = '[COMPLEX]'
                }
              }
            } else value = '[COMPLEX]'
          }
        }
        attrs.push({ name, value, isVarReference, isSpread })
      })
    }
    return attrs
  }
}
