/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { runCommand } from './run-command.js'

/**
 * Finds and returns the root-most directory of the analyzed project's source tree.
 *
 * @param cwd - Current working directory to use as the basis for finding the root directory.
 * @throws An exception if no usable root data was obtained.
 * @returns The path of the analyzed project's root directory or null.
 */
export async function getProjectRoot(cwd: string): Promise<string> {
  const result = await runCommand('git rev-parse --show-toplevel', { cwd })

  return result.stdout
}
