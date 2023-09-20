/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Logger } from '../../core/log/logger.js'
import { getTrackedFiles } from './get-tracked-files.js'
import { type JsxElement } from './interfaces.js'

/**
 * TODO.
 *
 * @param cwd
 * @param logger
 */
export async function getElements(cwd: string, logger: Logger): Promise<JsxElement[]> {
  // TODO: find elements in these files
  const trackedFiles = await getTrackedFiles(cwd, logger)

  return [
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
  ]
}
