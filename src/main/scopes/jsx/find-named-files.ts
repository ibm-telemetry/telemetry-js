/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { runCommand } from '../../core/run-command.js'

/**
 * Finds all files with a given name among all tracked files.
 *
 * @param cwd - Current working directory to find tracked files for.
 * @param logger - Logger instance.
 * @param fileName - Name to look for in tracked files.
 * @returns Array of string containing all found files with supplied name.
 */
export async function findNamedFiles(cwd: string, logger: Logger, fileName: string): Promise<string[]> {
  return (await runCommand(`git ls-tree -r --name-only HEAD | egrep "(/|^)${fileName}$"`, logger, { cwd })).stdout.replace(/\r/g, '').split(/\n/)
}
