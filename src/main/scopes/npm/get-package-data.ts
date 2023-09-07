import { exec } from '../../core/exec.js'
import { NpmPackageGetError } from '../../exceptions/npm-package-get-error.js'

/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export interface PackageData {
  name: string
  version: string
}

/**
 * Given a path to a package, get details about it, including name and version.
 *
 * @param packagePath - A directory to be treated as a package. It may or may not include a
 * package.json file directly in it.
 * @throws If no package details could be obtained or the directory didn't point to a valid package.
 * @returns An object containing details about the package.
 */
export function getPackageData(packagePath: string): PackageData {
  try {
    const { name, version } = JSON.parse(exec('npm pkg get name version', { cwd: packagePath }))
    return { name, version }
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new NpmPackageGetError(e.message)
    }
    throw e
  }
}
