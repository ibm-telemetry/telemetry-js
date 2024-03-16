/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * Creates a valid filename that can be used in the temp folder of the file system.
 *
 * @param date - Used in the filename. Usually the current date.
 * @returns A string representing an unused filename in the temp directory.
 */
export function createLogFilePath(date: string): string {
  const rand = Math.round(Math.random() * 999999)
    .toString()
    .padStart(6, '0')

  return join(tmpdir(), `ibmtelemetry-${date.replace(/[:.-]/g, '')}-${rand}.log`)
}
