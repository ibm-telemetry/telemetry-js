/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { exec } from '../../../core/exec.js'

/**
 * Given a path to a package.json file, get name, version, and type information about all
 * dependencies defined in it. The versions returned by this function are the exact version numbers
 * that were installed based on the package.json file.
 *
 * @param packageJsonPath - Path to a package.json file.
 * @throws An exception if the exec function fails or if the JSON.parse function fails.
 * @returns The result of the `npm ls` command top-level dependencies object parsed to an array of
 * objects containing name, version, and type keys.
 */
export function getPackageDependencies(packageJsonPath: string) {
  return Object.entries(
    JSON.parse(exec('npm ls --json', { cwd: packageJsonPath })).dependencies
  ).map(([key, value]) => {
    return {
      name: key,
      version: (value as { version: string }).version
      // TODO: type
    }
  })
}
