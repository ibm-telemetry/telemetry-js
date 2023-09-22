/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { getFileElements } from './get-file-elements.js'
import { getTrackedFiles } from './get-tracked-files.js'
import { type JsxElement } from './interfaces.js'

// TODOASKJOE
interface PromiseFulfilledResult<T> {
  status: 'fulfilled'
  value: T
}

/**
 * Finds all JSX elements in cwd's repository and computes prop values.
 *
 * @param cwd - Current working directory to find tracked files for.
 * @param logger - Logger instance.
 * @returns All JSX elements found in current repository.
 */
export async function getElements(cwd: string, logger: Logger): Promise<JsxElement[]> {
  // TODOASKJOE: is it correct to filter just by these file extensions?
  const trackedFiles = await getTrackedFiles(cwd, logger, ['jsx', 'js', 'tsx', 'ts'])

  const promises: Array<Promise<JsxElement[]>> = []
  trackedFiles.forEach(file => promises.push(getFileElements(file, logger)))

  // TODO: do we need to catch errors here?
  const results = await Promise.allSettled(promises).then(results => results.filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<JsxElement[]>).value))
  return results.flat()
}
