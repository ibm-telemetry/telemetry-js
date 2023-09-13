/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import childProcess from 'node:child_process'

import { RunCommandError } from '../exceptions/run-command-error.js'
import { guardShell } from './guard-shell.js'

interface Result {
  stdout: string
  stderr: string
  exitCode: number
}

/**
 * Runs a command using childProcess. Throws an exception if the command fails or exits with a
 * non-zero exit code.
 *
 * @param cmd - The command to invoke.
 * @param options - Options to include along with the command.
 * @param rejectOnError - Whether or not to reject the resulting promise when a non-zero exit code
 * is encountered.
 * @returns The standard output from the command.
 */
export async function runCommand(
  cmd: string,
  options: childProcess.SpawnOptions = {},
  rejectOnError: boolean = true
) {
  guardShell(cmd)

  const execOptions = {
    env: process.env,
    shell: true,
    ...options
  }

  return await new Promise<Result>((resolve, reject) => {
    let outData = ''
    let errorData = ''

    const proc = childProcess.spawn(cmd, execOptions)

    proc.stdout?.on('data', (data) => {
      outData += data.toString()
    })

    proc.stderr?.on('data', (data) => {
      errorData += data.toString()
    })

    proc.on('error', (err) => {
      if (rejectOnError) {
        reject(err)
      } else {
        resolve({
          exitCode: 'errno' in err && typeof err.errno === 'number' ? err.errno : -1,
          stderr: errorData,
          stdout: outData
        })
      }
    })

    proc.on('close', (exitCode) => {
      if (exitCode !== 0 && rejectOnError) {
        reject(
          new RunCommandError({
            exitCode: exitCode ?? 999,
            stderr: errorData.trim(),
            stdout: outData.trim()
          })
        )
      }
      resolve({
        exitCode: exitCode ?? 999,
        stderr: errorData.trim(),
        stdout: outData.trim()
      })
    })
  })
}
