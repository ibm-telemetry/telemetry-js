/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from './log/logger.js'
import { runCommand } from './run-command.js'

const cache = new Map<string, string>()

/**
 * Finds and returns the root-most directory of the analyzed repository's source tree.
 *
 * @param cwd - Current working directory to use as the basis for finding the root directory. This
 * is an absolute path.
 * @param logger - Logger instance.
 * @throws An exception if no usable root data was obtained.
 * @returns The absolute path of the analyzed project's root directory.
 */
export async function getRepositoryRoot(cwd: string, logger: Logger): Promise<string> {
  if (cache.has(cwd)) {
    logger.debug('getRepositoryRoot cache hit for ' + cwd)
    const data = cache.get(cwd) as string
    return data
  }

  cache.set(cwd, (await runCommand('git rev-parse --show-toplevel', logger, { cwd }, true)).stdout)

  return cache.get(cwd) as string
}
