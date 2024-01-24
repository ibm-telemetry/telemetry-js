/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import childProcess from 'node:child_process'

import { RunCommandError } from '../exceptions/run-command-error.js'
import { guardShell } from './guard-shell.js'
import { type Logger } from './log/logger.js'

export interface RunCommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

/**
 * Runs a command using childProcess. Throws an exception if the command fails or exits with a
 * non-zero exit code.
 *
 * @param cmd - The command to invoke.
 * @param logger - Instance to use for logging.
 * @param options - Options to include along with the command.
 * @param rejectOnError - Whether or not to reject the resulting promise when a non-zero exit code
 * is encountered.
 * @returns The standard output from the command.
 */
export async function runCommand(
  cmd: string,
  logger: Logger,
  options: childProcess.SpawnOptions = {},
  rejectOnError: boolean = true
) {
  logger.traceEnter('', 'runCommand', [cmd, options, rejectOnError])

  guardShell(cmd)

  let resolveFn: (value: RunCommandResult) => void
  let rejectFn: (reason: unknown) => void
  let outData = ''
  let errorData = ''
  let hasCallbackBeenTriggered = false

  const spawnOptions = {
    env: process.env,
    shell: true,
    ...options
  }
  const promise = new Promise<RunCommandResult>((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })
  const proc = childProcess.spawn(cmd, spawnOptions)

  proc.stdout?.on('data', (data) => {
    outData += data.toString()
  })

  proc.stderr?.on('data', (data) => {
    errorData += data.toString()
  })

  proc.on('error', (err) => {
    if (hasCallbackBeenTriggered) {
      return
    }

    let result

    if (rejectOnError) {
      result = new RunCommandError({
        exitCode: 'errno' in err && typeof err.errno === 'number' ? err.errno : -1,
        stderr: errorData.trim(),
        stdout: outData.trim(),
        exception: err,
        spawnOptions
      })
      rejectFn(result)
    } else {
      result = {
        exitCode: 'errno' in err && typeof err.errno === 'number' ? err.errno : -1,
        stderr: errorData,
        stdout: outData
      }
      resolveFn(result)
    }

    hasCallbackBeenTriggered = true
    logger.traceExit('', 'runCommand', result)
  })

  proc.on('close', (exitCode) => {
    if (hasCallbackBeenTriggered) {
      return
    }

    let result

    if (exitCode !== 0 && rejectOnError) {
      result = new RunCommandError({
        exitCode: exitCode ?? 999,
        stderr: errorData.trim(),
        stdout: outData.trim(),
        spawnOptions
      })
      rejectFn(result)
    } else {
      result = {
        exitCode: exitCode ?? 999,
        stderr: errorData.trim(),
        stdout: outData.trim()
      }
      resolveFn(result)
    }

    hasCallbackBeenTriggered = true
    logger.traceExit('', 'runCommand', result)
  })

  return await promise
}
