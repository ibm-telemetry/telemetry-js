/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Import } from '../../../interfaces.js'
import type { CdnImport } from '../interfaces.js'

/**
 * Checks if the provided import is a CdnImport.
 *
 * @param someImport - The Import to check.
 * @returns - (boolean) whether someImport is of type CdnImport.
 */
export function isCdnImport(someImport: Import): someImport is CdnImport {
  return 'package' in someImport && 'version' in someImport
}
