/*
 * Copyright IBM Corp. 2024, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DirectoryEnumerator } from '../../core/directory-enumerator.js'
import { Logger } from '../../core/log/logger.js'
import { runCommand } from '../../core/run-command.js'
import { NoNodeModulesFoundError } from '../../exceptions/no-node-modules-found-error.js'
import { hasNodeModulesFolder } from './has-node-modules-folder.js'

/**
 * Obtains data relating to package info and dependencies recursively,
 * starting from the root-most package.
 *
 * @param cwd - Current working directory. This must be inside of the root directory. This is an
 * absolute path.
 * @param root - Root-most directory. This is an absolute path.
 * @param logger - Logger instance.
 * @returns Object containing package and dependencies tree for the given root.
 */
export async function getDependencyTree(
  cwd: string,
  root: string,
  logger: Logger
): Promise<Record<string, unknown>> {
  const dirs = await new DirectoryEnumerator(logger).find(cwd, root, hasNodeModulesFolder)
  const topMostDir = dirs.pop()

  if (topMostDir === undefined) {
    throw new NoNodeModulesFoundError(cwd, root)
  }

  // Allow this command to try and obtain results even if it exited with a total or partial
  // error
  const commandResult = await runCommand('npm ls --all --json', logger, { cwd: topMostDir }, false)

  return JSON.parse(commandResult.stdout)
}
