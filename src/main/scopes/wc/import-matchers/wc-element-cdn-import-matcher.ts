/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CdnImport, CdnImportMatcher, WcElement } from '../interfaces.js'

/**
 * Finds a matching import for a WcElement from CDN imports.
 *
 * @param element - The WcElement to find an import for.
 * @param imports - The list of CdnImport objects collected from the file.
 * @returns A CdnImport if matched, otherwise undefined.
 */
export class WcElementCdnImportMatcher implements CdnImportMatcher<WcElement> {
  elementType: 'wc' = 'wc' as const
  /**
   * Finds the matching CdnImport for a given WcElement.
   *
   * @param element - WcElement to evaluate.
   * @param imports - CdnImports to use for comparison.
   * @returns Corresponding CdnImport if element was imported through a CDN in `imports`,
   * undefined otherwise.
   */
  findMatch(element: WcElement, imports: CdnImport[]) {
    return imports.find((i) => `${i.prefix}-${i.name}` === element.name)
  }
}
