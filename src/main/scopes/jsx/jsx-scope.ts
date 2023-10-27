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
import { type JsxElement, JsxElementsConfig } from './interfaces.js'
import { JsxNodeHandlerMap } from './jsx-node-handler-map.js'
import { JsxElementMetric } from './metrics/element-metric.js'
import { AllImportElementImportHandler } from './node-handlers/element-imports/all-import-element-import-handler.js'
import { DefaultImportElementImportHandler } from './node-handlers/element-imports/default-import-element-import-handler.js'
import { NamedImportElementImportHandler } from './node-handlers/element-imports/named-import-element-import-handler.js'
import { RenamedImportElementImportHandler } from './node-handlers/element-imports/renamed-import-element-import-handler.js'

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
    const fileNames = await findProjectFiles(this.cwd, this.logger, ['js', 'jsx', 'ts', 'tsx'])
    const instrumentedPkg = await getPackageData(this.cwd, this.logger)
    // TODOASKJOE
    const elements = findInstrumentedJsxElements(
      fileNames,
      instrumentedPkg.name,
      [
        AllImportElementImportHandler,
        DefaultImportElementImportHandler,
        NamedImportElementImportHandler,
        RenamedImportElementImportHandler
      ],
      JsxNodeHandlerMap
    )
    const packageJsonTree = await getPackageJsonTree(this.root, this.logger)

    for (const fileName of Object.keys(elements)) {
      const filePackage = await getFileRootPackage(fileName, packageJsonTree, this.logger)
      elements[fileName]?.forEach((element) => {
        element.importedBy = filePackage
        this.capture(new JsxElementMetric(element as JsxElement, config, this.logger))
      })
    }
  }
}
