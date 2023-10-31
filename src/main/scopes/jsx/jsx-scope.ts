/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { getPackageData } from '../npm/get-package-data.js'
import { findInstrumentedJsxElements } from './find-instrumented-jsx-elements.js'
import { findProjectFiles } from './find-project-files.js'
import { getFileRootPackage } from './get-file-root-package.js'
import { getPackageJsonTree } from './get-package-json-tree.js'
import { AllImportMatcher } from './import-matchers/all-import-matcher.js'
import { DefaultImportMatcher } from './import-matchers/default-import-matcher.js'
import { NamedImportMatcher } from './import-matchers/named-import-matcher.js'
import { RenamedImportMatcher } from './import-matchers/renamed-import-matcher.js'
import { type JsxElement } from './interfaces.js'
import { JsxNodeHandlerMap } from './jsx-node-handler-map.js'
import { JsxElementMetric } from './metrics/element-metric.js'

/**
 * Scope class dedicated to data collection from a jsx environment.
 */
export class JsxScope extends Scope {
  public override name = 'jsx' as const

  /**
   * Entry point for the scope. All scopes run asynchronously.
   */
  @Trace()
  public override async run(): Promise<void> {
    const collectorKeys = this.config.collect[this.name]
    if (collectorKeys === undefined || Object.keys(collectorKeys).length === 0) {
      throw new EmptyScopeError(this.name)
    }

    const promises: Array<Promise<void>> = []

    Object.keys(collectorKeys).forEach((key) => {
      switch (key) {
        case 'elements':
          promises.push(this.collectJsxElements())
          break
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Generates metrics for all discovered instrumented jsx elements found
   * in the current working directory's project.
   */
  @Trace()
  private async collectJsxElements(): Promise<void> {
    const fileNames = await findProjectFiles(this.cwd, this.logger, ['js', 'jsx', 'ts', 'tsx'])
    const instrumentedPkg = await getPackageData(this.cwd, this.logger)
    const elements = findInstrumentedJsxElements(
      fileNames,
      instrumentedPkg.name,
      [
        new AllImportMatcher(),
        new DefaultImportMatcher(),
        new NamedImportMatcher(),
        new RenamedImportMatcher()
      ],
      JsxNodeHandlerMap
    )
    const packageJsonTree = await getPackageJsonTree(this.root, this.logger)

    for (const fileName of Object.keys(elements)) {
      const filePackage = await getFileRootPackage(fileName, packageJsonTree, this.logger)
      elements[fileName]?.forEach((element) => {
        element.importedBy = filePackage
        this.capture(new JsxElementMetric(element as JsxElement, this.config, this.logger))
      })
    }
  }
}
