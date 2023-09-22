/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { type JsxElement } from './interfaces.js'

/**
 * Finds all JSX elements in supplied file and computes prop values.
 *
 * @param filePath - Path to the file to analyze.
 * @param logger - Logger instance.
 * @returns All JSX elements found in filePath.
 */
export async function getFileElements(filePath: string, logger: Logger): Promise<JsxElement[]> {
  // TODO: real data
  return await Promise.resolve([
    {
      raw: '<ExampleElement knownAttribute1="topSecretValue" knownAttribute2="topSecrectValue">',
      name: 'ExampleElement',
      attributes: [
        {
          name: 'knownAttribute1',
          value: 'topSecretValue'
        },
        {
          name: 'knownAttribute2',
          value: 'topSecretValue'
        }
      ]
    }
  ])
}
