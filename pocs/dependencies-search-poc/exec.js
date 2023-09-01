/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import childProcess from 'node:child_process'

import { guardShell } from './guard-shell.js'

/**
 * Executes a command using childProcess. Throws an exception if the command fails.
 *
 * @param cmd - The command to invoke.
 * @param options - Options to include along with the command.
 * @throws An exception if the command timed out or exited with a non-zero code.
 * @returns The standard output from the command.
 */
export function exec(cmd, options = {}) {
  guardShell(cmd)

  const execOptions = {
    env: process.env,
    ...options
  }

  return childProcess.execSync(cmd, execOptions).toString().trim()
}
