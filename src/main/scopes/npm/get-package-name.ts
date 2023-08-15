/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { exec } from '../../core/exec.js'

/**
 * Uses the `pkg get` NPM command to get the name from the package.json file closest to this file.
 *
 * @returns The result of the get name command.
 */
export function getPackageName() {
  const cwd = path.dirname(import.meta.url.substring(7))

  return exec('npm pkg get name', { cwd })
}
