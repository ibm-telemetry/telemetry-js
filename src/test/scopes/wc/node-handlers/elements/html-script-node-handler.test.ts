/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Node as HtmlNode } from 'domhandler'
import { describe, expect, it } from 'vitest'

import { getTrackedSourceFiles } from '../../../../../main/core/get-tracked-source-files.js'
import type { HtmlParsedFile } from '../../../../../main/scopes/wc/interfaces.js'
import type { INodeAdapter } from '../../../../../main/scopes/wc/interfaces.js'
import { createNodeAdapter } from '../../../../../main/scopes/wc/node-handlers/adapters/create-node-adapters.js'
import { WcScriptNodeHandler } from '../../../../../main/scopes/wc/node-handlers/elements/html-script-node-handler.js'
import { WcElementAccumulator } from '../../../../../main/scopes/wc/wc-element-accumulator.js'
import { WcScope } from '../../../../../main/scopes/wc/wc-scope.js'
import { findNodesByType } from '../../../../__utils/find-nodes-by-type.js'
import { Fixture } from '../../../../__utils/fixture.js'
import { initLogger } from '../../../../__utils/init-logger.js'

describe('class: WcScriptNodeHandler', async () => {
  const logger = initLogger()
  const fixture = new Fixture('projects/web-components-project/test.html')
  const sourceFile = (await (
    await getTrackedSourceFiles(fixture.path, fixture.path, logger, WcScope.fileExtensions)
  )[0]?.createSourceFile()) as HtmlParsedFile
  const accumulator = new WcElementAccumulator()
  const handler = new WcScriptNodeHandler(sourceFile, logger)
  it('correctly returns the script sources for an html file fixture', async () => {
    const rootAdapter = createNodeAdapter(sourceFile) as INodeAdapter
    //@ts-expect-error typescript not accepting adapter for type ts source file
    const wcScriptSourceNodes = findNodesByType(rootAdapter, 'HtmlScript') as HtmlNode[]

    wcScriptSourceNodes.forEach((scriptSource) => {
      handler.handle(scriptSource, accumulator)
    })

    expect(accumulator.scriptSources).toMatchSnapshot()
  })
})
