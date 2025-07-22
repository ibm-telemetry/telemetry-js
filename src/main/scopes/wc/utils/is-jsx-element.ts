/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { JsxElement } from '../../jsx/interfaces.js'

/**
 *
 * @param element
 */
export function isJsxElement(element: any): element is JsxElement {
  return 'prefix' in element && 'attributes' in element
}
