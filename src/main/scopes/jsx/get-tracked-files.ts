/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { runCommand } from '../../core/run-command.js'

/**
 * Finds all files tracked by git in the supplied cwd.
 *
 * @param cwd - Current working directory to find tracked files for.
 * @param logger - Logger instance.
 * @param extensions - Array of extensions to filter by.
 * @returns Array of string containing tracked files.
 */
export async function getTrackedFiles(cwd: string, logger: Logger, extensions: string[] = []): Promise<string[]> {
  const results = (await runCommand('git ls-tree --full-tree --name-only -r HEAD', logger, { cwd })).stdout.replace(/\r/g, '').split(/\n/)
  if (extensions.length > 0) {
    return results.filter(file => extensions.some(extension => file.endsWith(extension)))
  }
  return results
}
