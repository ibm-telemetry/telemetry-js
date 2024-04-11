/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { JsAccumulator } from './js-accumulator.js'

/**
 * Give a JsAccumulator with previously computed imports, discards all import objects
 * that do not belong to the given package.
 *
 * @param accumulator - The accumulator in which to import data is stored.
 * @param packageName - Name of the package to filter imports for.
 */
export function removeIrrelevantImports(accumulator: JsAccumulator, packageName: string) {
  accumulator.imports = accumulator.imports.filter((jsImport) => {
    return jsImport.path === packageName || jsImport.path.startsWith(`${packageName}/`)
  })
}
