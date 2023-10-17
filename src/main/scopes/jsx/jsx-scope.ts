/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JsxElementsConfig } from '../../../schemas/Schema.js'
import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { getPackageData } from '../npm/get-package-data.js'
import { findInstrumentedJsxElements } from './find-instrumented-jsx-elements.js'
import { getFileRootPackage } from './get-file-root-package.js'
import { getPackageJsonTree } from './get-package-json-tree.js'
import { getProjectFiles } from './get-project-files.js'
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

    Object.entries(collectorKeys).forEach(([key, value]) => {
      switch (key) {
        case 'elements':
          promises.push(this.collectJsxElements(value))
          break
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Generates metrics for all discovered instrumented jsx elements found
   * in the current working directory's project.
   *
   * @param config - Determines which attributes name and values to collect for.
   */
  @Trace()
  private async collectJsxElements(config: JsxElementsConfig): Promise<void> {
    const fileNames = await getProjectFiles(this.cwd, this.logger)
    const instrumentedPkg = await getPackageData(this.cwd, this.logger)
    const elements = findInstrumentedJsxElements(fileNames, instrumentedPkg.name)
    const packageJsonTree = await getPackageJsonTree(this.root, this.logger)

    for (const fileName of Object.keys(elements)) {
      const filePackage = await getFileRootPackage(fileName, packageJsonTree, this.logger)
      elements[fileName]?.forEach((element) => {
        element.importedBy = filePackage
        this.capture(new JsxElementMetric(element, config))
      })
    }
  }
}
