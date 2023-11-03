/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { findAllJsxElements } from './find-all-jsx-elements.js'
import {
  type ElementNodeHandlerMap,
  type JsxElementImportMatcher,
  type PartialJsxElement
} from './interfaces.js'
import { type JsxScopeAccumulator } from './jsx-scope-accumulator.js'

/**
 * Finds all JSX elements in cwd's repository and computes prop values.
 *
 * @param sourceFiles - List of filepaths to process when looking for JsxElements.
 * @param instrumentedPkg - Name of the instrumented package to find JsxElements for.
 * @param elementMatchers - Array of matchers to determine whether a given element has been imported
 *  by the instrumentedPkg.
 * @param jsxNodeHandlerMap - Determines what handlers (instances) are called given
 * the found node types.
 * @returns All JSX elements found in current repository.
 */
export function findInstrumentedJsxElements(
  sourceFiles: ts.SourceFile[],
  instrumentedPkg: string,
  elementMatchers: JsxElementImportMatcher[],
  jsxNodeHandlerMap: ElementNodeHandlerMap
): Record<string, PartialJsxElement[]> {
  const fileData: Record<string, JsxScopeAccumulator> = {}
  const elements: Record<string, PartialJsxElement[]> = {}
  for (const sourceFile of sourceFiles) {
    fileData[sourceFile.fileName] = findAllJsxElements(sourceFile, jsxNodeHandlerMap)
  }
  Object.entries(fileData).forEach(([fileName, accumulator]) => {
    const importedIdentifiers = accumulator.imports
      .filter((i) => i.importPath.startsWith(instrumentedPkg))
      .map((i) => i.elements)
      .flat()
    elements[fileName] = []
    accumulator.elements.forEach((el) => {
      const matcher = elementMatchers.find((c) => c.isMatch(el, importedIdentifiers))
      if (matcher !== undefined) {
        elements[fileName]?.push(el)
      }
    })
  })
  return elements
}
