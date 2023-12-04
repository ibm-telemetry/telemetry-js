/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import childProcess from 'child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
childProcess
  .spawn(
    `node ${path.join(dirname(fileURLToPath(import.meta.url)), 'collect.js')}`,
    process.argv.slice(2),
    {
      stdio: 'ignore',
      detached: true,
      shell: true
    }
  )
  .unref()
