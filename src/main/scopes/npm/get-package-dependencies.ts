/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { exec } from '../../core/exec.js'

/**
 * Uses the `pkg get` NPM command to get the dependencies or devDependencies from the
 * package.json file closest to this
 * file.
 *
 * @param type - Determines whether to get base dependencies or dev dependencies.
 * Defaults to 'base'.
 * @returns The result of the get dependencies command parsed to JSON.
 */
export function getPackageDependencies(type: 'base' | 'dev' = 'base') {
  const cwd = path.dirname(import.meta.url.substring(7))

  return Object.entries(
    JSON.parse(
      exec(type === 'base' ? 'npm pkg get dependencies' : 'npm pkg get devDependencies', { cwd })
    )
  ).map(([key, value]) => {
    return {
      name: key,
      version: value
    }
  })
}
