/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path'

import { NoProjectRootError } from '../exceptions/no-project-root-error.js'
import { exec } from './exec.js'

/**
 * Finds and returns the root-most directory of the analyzed project's source tree.
 *
 * @throws An exception if no usable root data was obtained.
 * @returns The path of the analyzed project's root directory or null.
 */
export async function getProjectRoot(): Promise<string> {
  let currentResult
  let root
  let cwd = process.cwd()

  do {
    try {
      currentResult = await exec('npm pkg get name', { cwd })
    } catch {
      currentResult = undefined
    }

    if (currentResult !== undefined) {
      root = cwd
    }

    cwd = path.join(cwd, '..')
  } while (typeof currentResult === 'string')

  if (root === undefined) {
    throw new NoProjectRootError()
  }

  return root
}
