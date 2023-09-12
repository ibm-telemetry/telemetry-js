/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { runCommand } from '../../core/run-command.js'
import { type PackageData } from './interfaces.js'

/**
 * Given a path to a package, get details about it, including name and version.
 *
 * @param packagePath - A directory to be treated as a package. It may or may not include a
 * package.json file directly in it.
 * @throws If no package details could be obtained or the directory didn't point to a valid package.
 * @returns An object containing details about the package.
 */
export async function getPackageData(packagePath: string): Promise<PackageData> {
  const result = await runCommand('npm pkg get name version', { cwd: packagePath })
  return JSON.parse(result.stdout)
}
