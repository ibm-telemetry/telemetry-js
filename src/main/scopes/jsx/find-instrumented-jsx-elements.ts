/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { findAllJsxElements } from './find-all-jsx-elements.js'
import { type PartialJsxElement } from './interfaces.js'
import { type JsxScopeAccumulator } from './jsx-scope-accumulator.js'

/**
 * Finds all JSX elements in cwd's repository and computes prop values.
 *
 * @param fileNames - List of filepaths to process when looking for JsxElements.
 * @param instrumentedPkg - Name of the instrumented package to find JsxElements for.
 * @returns All JSX elements found in current repository.
 */
export function findInstrumentedJsxElements(
  fileNames: string[],
  instrumentedPkg: string
): Record<string, PartialJsxElement[]> {
  const fileData: Record<string, JsxScopeAccumulator> = {}
  const elements: Record<string, PartialJsxElement[]> = {}
  const program = ts.createProgram(fileNames, {})
  const sourceFiles = program.getSourceFiles().filter(file => !file.isDeclarationFile)
  for (const sourceFile of sourceFiles) {
    fileData[sourceFile.fileName] = findAllJsxElements(sourceFile)
  }
  Object.entries(fileData).forEach(([fileName, accumulator]) => {
    // TODOASKJOE: check this logic
    const importedElements = accumulator.imports
      .filter((i) => i.importPath.startsWith(instrumentedPkg))
      .map((i) => i.elements)
      .flat()
    elements[fileName] = []
    accumulator.elements.forEach((el) => {
      if (
        typeof el.prefix === 'string' &&
        importedElements.some(
          // In order:
          // import {something as somethingElse} from 'package
          // import something from 'package'
          // import * as something from 'package'
          (i) =>
            i.rename === el.prefix ||
            (i.isDefault && i.name === el.prefix) ||
            (i.isAll && i.name === el.prefix)
        )
      ) {
        // this is never undefined (line 33)
        elements[fileName]?.push(el)
      }
      if (typeof el.prefix !== 'string' && importedElements.some((imp) => imp.name === el.name)) {
        // this is never undefined (line 33)
        elements[fileName]?.push(el)
      }
    })
  })
  return elements
}
