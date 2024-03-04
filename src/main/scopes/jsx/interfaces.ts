/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComplexValue } from '../js/complex-value.js'

export interface JsxElementAttribute {
  name: string
  value: string | number | boolean | ComplexValue | null | undefined
}

export interface JsxElement {
  name: string
  prefix: string | undefined
  attributes: JsxElementAttribute[]
}
