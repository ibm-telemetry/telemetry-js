/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface RunCommandErrorReason {
  exitCode: number
  stderr: string
  stdout: string
}

/**
 * Error indicating a non-zero exit code of a command that was run via `runCommand`.
 */
export class RunCommandError extends Error {
  constructor(reason: RunCommandErrorReason) {
    super(JSON.stringify(reason))
  }
}
