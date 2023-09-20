/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { runCommand } from '../../core/run-command.js'

/**
 * TODO.
 *
 * @param cwd
 * @param logger
 */
export async function getTrackedFiles(cwd: string, logger: Logger): Promise<string[]> {
  const result = await runCommand('git ls-tree --full-tree --name-only -r HEAD', logger, { cwd })
  console.log(result)
}
