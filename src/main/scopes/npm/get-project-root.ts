/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// TODO: should this live in some other place since it might be useful to have for other scopes?
// until we have a second scope, it might not be worth trying to centralize it

import path from 'path'

import { exec } from '../../core/exec.js'

/**
 * Finds and returns the root-most directory of the analyzed project's source tree.
 *
 * @returns The path of the analyzed project's root directory or null.
 */
export function getProjectRoot(): string | null {
  let prevRoot = null
  let cwd = process.cwd()

  while (true) {
    try {
      exec('npm pkg get name', { cwd })
      prevRoot = cwd
      cwd = path.join(cwd, '..')
    } catch (_e) {
      return prevRoot
    }
  }
}
