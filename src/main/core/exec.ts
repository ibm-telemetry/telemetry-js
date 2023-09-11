/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import childProcess from 'node:child_process'
import util from 'node:util'

import { guardShell } from './guard-shell.js'

const runCommand = util.promisify(childProcess.exec)

/**
 * Executes a command using childProcess. Throws an exception if the command fails or exits with a
 * non-zero exit code.
 *
 * @param cmd - The command to invoke.
 * @param options - Options to include along with the command.
 * @throws An error if the command timed out or exited with a non-zero code.
 * @returns The standard output from the command.
 */
export async function exec(cmd: string, options: childProcess.ExecOptions = {}) {
  guardShell(cmd)

  const execOptions = {
    env: process.env,
    ...options
  }

  const proc = await runCommand(cmd, execOptions)

  return proc.stdout.toString().trim()
}
