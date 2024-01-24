/*
 * Copyright IBM Corp. 2023, 2024
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
