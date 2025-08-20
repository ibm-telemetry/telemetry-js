/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Import } from '../../../interfaces.js'
import type { JsImport } from '../interfaces.js'

/**
 * Checks if the provided import is a JsImport.
 *
 * @param someImport - The Import to check.
 * @returns - (boolean) whether someImport is of type JsImport.
 */
export function isJsImport(someImport: Import): someImport is JsImport {
  return 'isDefault' in someImport && 'isAll' in someImport
}
