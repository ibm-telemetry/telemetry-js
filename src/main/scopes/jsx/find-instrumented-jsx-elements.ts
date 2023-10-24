/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { findAllJsxElements } from './find-all-jsx-elements.js'
import { type Matcher, type PartialJsxElement } from './interfaces.js'
import { type JsxScopeAccumulator } from './jsx-scope-accumulator.js'
import { DefaultImportMatcher } from './matchers/elements/default-import-matcher.js'

/**
 * Finds all JSX elements in cwd's repository and computes prop values.
 *
 * @param fileNames - List of filepaths to process when looking for JsxElements.
 * @param instrumentedPkg - Name of the instrumented package to find JsxElements for.
 * @param elementMatchers - Array of matchers to determine whether a given element has been imported
 *  by the instrumentedPkg.
 * @returns All JSX elements found in current repository.
 */
export function findInstrumentedJsxElements(
  fileNames: string[],
  instrumentedPkg: string,
  elementMatchers: Array<Matcher<PartialJsxElement>>
): Record<string, PartialJsxElement[]> {
  const fileData: Record<string, JsxScopeAccumulator> = {}
  const elements: Record<string, PartialJsxElement[]> = {}
  const program = ts.createProgram(fileNames, {})
  const sourceFiles = program.getSourceFiles().filter(file => !file.isDeclarationFile)
  for (const sourceFile of sourceFiles) {
    fileData[sourceFile.fileName] = findAllJsxElements(sourceFile)
  }
  Object.entries(fileData).forEach(([fileName, accumulator]) => {
    const importedIdentifiers = accumulator.imports
      .filter((i) => i.importPath.startsWith(instrumentedPkg))
      .map((i) => i.elements)
      .flat()
    elements[fileName] = []
    accumulator.elements.forEach((el) => {
      const matcher = elementMatchers.find(c => c.isMatch(el, { imports: importedIdentifiers }))
      if (matcher) {
        if (matcher === DefaultImportMatcher && !el.prefix) {
          // rewrite name to Default as this info might be sensitive (element has been renamed)
          el.name = '[Default]'
          elements[fileName]?.push(el)
        }
      }
    })
  })
  return elements
}
