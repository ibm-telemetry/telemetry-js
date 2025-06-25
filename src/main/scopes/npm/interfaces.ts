/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface PackageData {
  name: string
  version: string
}

export interface InstallingPackage extends PackageData {
  dependencies: PackageData[]
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
