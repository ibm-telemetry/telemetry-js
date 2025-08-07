/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../main/core/get-tracked-source-files.js'
import { processFile } from '../../../main/scopes/js/process-file.js'
import { WcElementAccumulator } from '../../../main/scopes/wc/wc-element-accumulator.js'
import { wcNodeHandlerMap } from '../../../main/scopes/wc/wc-node-handler-map.js'
import { WcScope } from '../../../main/scopes/wc/wc-scope.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('processHtmlFile', () => {
  const fixture = new Fixture('projects/web-components-project/test.html')
  const logger = initLogger()

  it('correctly detects web components in a given html file', async () => {
    const accumulator = new WcElementAccumulator()
    const parsedHtmlFile = (await (
      await getTrackedSourceFiles(fixture.path, fixture.path, logger, WcScope.fileExtensions)
    )[0]?.createSourceFile()) as ts.SourceFile

    processFile(accumulator, parsedHtmlFile, wcNodeHandlerMap, logger)
    expect(accumulator.elements).toMatchSnapshot('elements')
  })
})
