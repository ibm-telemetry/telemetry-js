/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { findAllJsxElements } from './find-all-jsx-elements.js'
import { type JsxElement } from './interfaces.js'
import { type JsxScopeAccumulator } from './jsx-scope-accumulator.js'

/**
 * Finds all JSX elements in cwd's repository and computes prop values.
 *
 * @param fileNames - List of filepaths to process when looking for JsxElements.
 * @param instrumentedPkg - Name of the instrumented package to find JsxElements for.
 * @returns All JSX elements found in current repository.
 */
export function findInstrumentedJsxElements(fileNames: string[], instrumentedPkg: string): JsxElement[] {
  const accumulators: JsxScopeAccumulator[] = []
  const elements: JsxElement[] = []
  const program = ts.createProgram(fileNames, {})
  for (const sourceFile of program.getSourceFiles()) {
    // TODOASKJOE: do we care about declaration files?
    if (!sourceFile.isDeclarationFile) {
      accumulators.push(findAllJsxElements(sourceFile))
    }
  }
  accumulators.forEach(acc => {
    // TODOASKJOE: check this logic
    const importedElements = acc.imports.filter(i => i.importPath.startsWith(instrumentedPkg)).map(i => i.elements).flat()
    acc.elements.forEach(el => {
      if (typeof el.prefix === 'string' && importedElements.some(
        // In order:
        // import {something as somethingElse} from 'package
        // import something from 'package'
        // import * as something from 'package'
        i => i.rename === el.prefix || (i.isDefault && i.name === el.prefix) || (i.isAll && i.name === el.prefix))) {
        elements.push(el)
      }
      if (typeof el.prefix !== 'string' && importedElements.some(imp => imp.name === el.name)) {
        elements.push(el)
      }
    })
  })
  return elements
}
