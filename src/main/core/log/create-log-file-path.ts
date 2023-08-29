/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { tmpName } from 'tmp-promise'

/**
 * Creates a valid filename that can be used in the temp folder of the file system.
 *
 * @param date - Used in the filename. Usually the current date.
 * @returns A string representing an unused filename in the temp directory.
 */
export async function createLogFilePath(date: string) {
  return await tmpName({
    template: `ibmtelemetrics-${date.replace(/[:.-]/g, '')}-XXXXXX.log`
  })
}
