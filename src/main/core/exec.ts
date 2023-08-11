/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import childProcess from 'node:child_process'

function exec(cmd: string, options = {}) {
  guardShell(cmd)

  const execOptions = {
    env: process.env,
    ...options
  }
  return childProcess.execSync(cmd, execOptions).toString().trim()
}

function guardShell(cmd: string) {
  if (/[\\$;`]/.exec(cmd) != null) {
    throw new Error(
      'Shell guard prevented a command from running because it contained special characters: ' + cmd
    )
  }
}

export { exec }
