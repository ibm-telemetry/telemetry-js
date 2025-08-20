/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'
import { describe, expectTypeOf, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../../main/core/get-tracked-source-files.js'
import { JsxScope } from '../../../../../main/scopes/jsx/jsx-scope.js'
import type { HtmlParsedFile } from '../../../../../main/scopes/wc/interfaces.js'
import { createNodeAdapter } from '../../../../../main/scopes/wc/node-handlers/adapters/create-node-adapters.js'
import type { HtmlNodeAdapter } from '../../../../../main/scopes/wc/node-handlers/adapters/html-node-adapter.js'
import type { TsNodeAdapter } from '../../../../../main/scopes/wc/node-handlers/adapters/ts-node-adapter.js'
import { WcScope } from '../../../../../main/scopes/wc/wc-scope.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('createNodeAdapters', async () => {
  const logger = initLogger()
  const htmlFixture = new Fixture('projects/web-components-project/test.html')
  const jsxFixture = new Fixture('jsx-samples/all-jsx-element-types.tsx')
  const htmlSourceFile = (await (
    await getTrackedSourceFiles(htmlFixture.path, htmlFixture.path, logger, WcScope.fileExtensions)
  )[0]?.createSourceFile()) as HtmlParsedFile
  const jsxSourceFile = (await (
    await getTrackedSourceFiles(jsxFixture.path, jsxFixture.path, logger, JsxScope.fileExtensions)
  )[0]?.createSourceFile()) as ts.SourceFile

  it('correctly returns a valid HtmlNodeAdapter for a given HtmlParsedFile', async () => {
    const adapter = createNodeAdapter(htmlSourceFile) as HtmlNodeAdapter
    expectTypeOf(adapter).toEqualTypeOf<HtmlNodeAdapter>()
  })

  it('correctly returns a valid TsNodeAdapter for a given JSX source file', async () => {
    const adapter = createNodeAdapter(jsxSourceFile) as TsNodeAdapter
    expectTypeOf(adapter).toEqualTypeOf<TsNodeAdapter>()
  })
})
