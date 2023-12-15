/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from './log/logger.js'
import { runCommand } from './run-command.js'

/**
 * Finds and returns the list of branches that point to the HEAD commit.
 *
 * @param commitHash - The hash of the commit to obtain branches for.
 * @param cwd - Current working directory to use as the basis for finding the branches. This
 * is an absolute path.
 * @param logger - Logger instance.
 * @throws An exception if no usable branch data was obtained.
 * @returns The list of branches that point to the head commit, as an array.
 */
export async function getCommitBranches(
  commitHash: string,
  cwd: string,
  logger: Logger
): Promise<string[]> {
  const allBranches = (
    await runCommand(
      `git branch --points-at=${commitHash} --format='%(refname:short)'`,
      logger,
      { cwd },
      true
    )
  ).stdout
    .split(/\r?\n/g)
    .filter((file) => file !== '')

  return allBranches
}
