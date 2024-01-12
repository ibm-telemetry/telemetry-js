/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { access } from 'fs/promises'
import path from 'path'

/**
 * Given a directory path, determines if a node_modules folder exists directly inside of it.
 *
 * @param dirPath - The path to the directory to query.
 * @returns True if node_modules folder exists, False otherwise.
 */
export async function hasNodeModulesFolder(dirPath: string) {
  let err

  try {
    await access(path.join(dirPath, 'node_modules'))
  } catch (e) {
    err = e
  }

  return err === undefined
}
