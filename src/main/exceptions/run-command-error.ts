/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type SpawnOptions } from 'node:child_process'

import { type RunCommandResult } from '../core/run-command.js'

export interface RunCommandErrorReason extends RunCommandResult {
  exception?: unknown
  spawnOptions: SpawnOptions
}

/**
 * Error indicating a non-zero exit code of a command that was run via `runCommand`.
 */
export class RunCommandError extends Error {
  constructor(reason: RunCommandErrorReason) {
    super(JSON.stringify(reason, undefined, 2))
  }
}
