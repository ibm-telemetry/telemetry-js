/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../main/core/get-tracked-source-files.js'
import { processFile } from '../../../main/scopes/js/process-file.js'
import { JsxElementAccumulator } from '../../../main/scopes/jsx/jsx-element-accumulator.js'
import { jsxNodeHandlerMap } from '../../../main/scopes/jsx/jsx-node-handler-map.js'
import { JsxScope } from '../../../main/scopes/jsx/jsx-scope.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

describe('processFile', () => {
  const fixture = new Fixture('projects/basic-project/test.jsx')
  const logger = initLogger()

  it('correctly detects imports and elements in a given file', async () => {
    const accumulator = new JsxElementAccumulator()
    const sourceFile = (await (
      await getTrackedSourceFiles(fixture.path, fixture.path, logger, JsxScope.fileExtensions)
    )[0]?.createSourceFile()) as ts.SourceFile

    processFile(accumulator, sourceFile, jsxNodeHandlerMap, logger)
    expect(accumulator.elements).toMatchSnapshot('elements')
    expect(accumulator.imports).toMatchSnapshot('imports')
  })
})
