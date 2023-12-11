/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import childProcess from 'child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { createLogFilePath } from './core/log/create-log-file-path.js'

const date = new Date().toISOString()
const logFilePath = createLogFilePath(date)
console.log('Log file:', logFilePath)
childProcess
  .spawn(
    process.argv0,
    [
      path.join(dirname(fileURLToPath(import.meta.url)), 'background-process.js'),
      `--log=${logFilePath}`,
      ...process.argv.slice(2)
    ],
    {
      stdio: 'ignore',
      detached: true,
      shell: true
    }
  )
  .unref()
