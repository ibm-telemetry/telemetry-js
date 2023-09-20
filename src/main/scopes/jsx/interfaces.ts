/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export interface JsxElement {
  name: string
  raw: string
  attributes: Array<{ name: string, value: unknown }>
}

export interface ElementData {
  name: string
  raw: string
  attributeNames: string[]
  attributeValues: string[]
  nameSubstitutions: Record<string, string>
  valueSubstitutions: Record<string, string>
}
