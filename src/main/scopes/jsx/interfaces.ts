/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComplexValue } from '../js/complex-value.js'
import { JsImport } from '../js/interfaces.js'
import { PackageData } from '../npm/interfaces.js'

export interface JsxElementAttribute {
  name: string
  value: string | number | boolean | ComplexValue | null | undefined
}

export interface JsxElement {
  name: string
  prefix: string | undefined
  attributes: JsxElementAttribute[]
}

export interface FileTree {
  path: string
  children: FileTree[]
}

export interface JsxElementImportMatcher {
  findMatch: (element: JsxElement, imports: JsImport[]) => JsImport | undefined
}

export interface DependencyTreeDependency {
  version: string
  dependencies: Record<string, DependencyTreeDependency>
}

export interface DependencyTree extends PackageData {
  name: string
  version: string
  dependencies: Record<string, DependencyTreeDependency>
  [key: string]: unknown
}
