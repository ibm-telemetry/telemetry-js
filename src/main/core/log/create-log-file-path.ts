/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { tmpNameSync } from 'tmp-promise'

/**
 * Creates a valid filename that can be used in the temp folder of the file system.
 *
 * @param date - Used in the filename. Usually the current date.
 * @returns A string representing an unused filename in the temp directory.
 */
export function createLogFilePath(date: string): string {
  return tmpNameSync({
    template: `ibmtelemetry-${date.replace(/[:.-]/g, '')}-XXXXXX.log`
  })
}
