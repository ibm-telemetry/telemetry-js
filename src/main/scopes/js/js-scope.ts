/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ConfigSchema } from '@ibm/telemetry-config-schema'
import type * as ts from 'typescript'

import { Trace } from '../../core/log/trace.js'
import { Scope } from '../../core/scope.js'
import { EmptyScopeError } from '../../exceptions/empty-scope.error.js'
import { findRelevantSourceFiles } from '../js/find-relevant-source-files.js'
import { JsFunction, JsImportMatcher, JsToken } from '../js/interfaces.js'
import { processFile } from '../js/process-file.js'
import { removeIrrelevantImports } from '../js/remove-irrelevant-imports.js'
import { getPackageData } from '../npm/get-package-data.js'
import { PackageData } from '../npm/interfaces.js'
import { JsFunctionAllImportMatcher } from './import-matchers/functions/js-function-all-import-matcher.js'
import { JsFunctionNamedImportMatcher } from './import-matchers/functions/js-function-named-import-matcher.js'
import { JsFunctionRenamedImportMatcher } from './import-matchers/functions/js-function-renamed-import-matcher.js'
import { JsTokenAllImportMatcher } from './import-matchers/tokens/js-token-all-import-matcher.js'
import { JsTokenNamedImportMatcher } from './import-matchers/tokens/js-token-named-import-matcher.js'
import { JsTokenRenamedImportMatcher } from './import-matchers/tokens/js-token-renamed-import-matcher.js'
import { JsFunctionTokenAccumulator } from './js-function-token-accumulator.js'
import { jsNodeHandlerMap } from './js-node-handler-map.js'
import { FunctionMetric } from './metrics/function-metric.js'
import { TokenMetric } from './metrics/token-metric.js'

/**
 * Scope class dedicated to data collection from a jsx environment.
 */
export class JsScope extends Scope {
  public override name = 'js' as const // TODO: should be fixed when configschema updates
  private runSync = false
  public static readonly fileExtensions = [
    '.jsx',
    '.mjs',
    '.js',
    '.cjs',
    '.tsx',
    '.mts',
    '.ts',
    '.cts',
    '.mjsx',
    '.cjsx',
    '.mtsx',
    '.ctsx'
  ]

  /**
   * Entry point for the scope. All scopes run asynchronously.
   */
  @Trace()
  public override async run(): Promise<void> {
    const collectorKeys = this.config.collect[this.name] // TODO: should be fixed when configschema updates
    if (collectorKeys === undefined || Object.keys(collectorKeys).length === 0) {
      throw new EmptyScopeError(this.name)
    }

    await this.captureAllMetrics()
  }

  /**
   * Generates metrics for all discovered instrumented js functions and tokens
   * found in the current working directory's project, depending on config.
   */
  @Trace()
  async captureAllMetrics(): Promise<void> {
    const collectorKeys = this.config.collect[this.name] // TODO: should be fixed when configschema updates
    if (collectorKeys === undefined || Object.keys(collectorKeys).length === 0) {
      throw new EmptyScopeError(this.name)
    }
    // TODO: these might end up becoming one and the same (same matchers for functions and tokens)
    const functionImportMatchers: JsImportMatcher<JsFunction>[] = [
      new JsFunctionAllImportMatcher(),
      new JsFunctionNamedImportMatcher(),
      new JsFunctionRenamedImportMatcher()
    ]

    const tokenImportMatchers: JsImportMatcher<JsToken>[] = [
      new JsTokenAllImportMatcher(),
      new JsTokenNamedImportMatcher(),
      new JsTokenRenamedImportMatcher()
    ]

    const instrumentedPackage = await getPackageData(this.cwd, this.cwd, this.logger)

    const sourceFiles = await findRelevantSourceFiles(
      instrumentedPackage,
      this.cwd,
      this.root,
      JsScope.fileExtensions,
      this.logger
    )

    this.logger.debug('Filtered source files: ' + sourceFiles.map((f) => f.fileName))

    const promises: Promise<void>[] = []

    for (const sourceFile of sourceFiles) {
      const resultPromise = this.captureFileMetrics(
        sourceFile,
        instrumentedPackage,
        tokenImportMatchers,
        functionImportMatchers,
        collectorKeys
      )

      if (this.runSync) {
        await resultPromise
      } else {
        promises.push(resultPromise)
      }
    }

    await Promise.allSettled(promises)
  }

  /**
   * Generates metrics for all discovered instrumented js functions and tokens found
   * in the supplied SourceFile node, depending on config.
   *
   * @param sourceFile - The sourcefile node to generate metrics for.
   * @param instrumentedPackage - Name and version of the instrumented package
   * to capture metrics for.
   * @param tokenImportMatchers - Matchers instances to use for import-token matching.
   * @param functionImportMatchers - Matchers instances to use for import-function matching.
   * @param collectorKeys - Config keys defined for JS scope.
   */
  async captureFileMetrics(
    sourceFile: ts.SourceFile,
    instrumentedPackage: PackageData,
    tokenImportMatchers: JsImportMatcher<JsToken>[],
    functionImportMatchers: JsImportMatcher<JsFunction>[],
    collectorKeys: ConfigSchema['collect']['js'] // TODO: should be fixed when configschema updates
  ) {
    const accumulator = new JsFunctionTokenAccumulator()

    processFile(accumulator, sourceFile, jsNodeHandlerMap, this.logger)
    removeIrrelevantImports(accumulator, instrumentedPackage.name)

    const promises: Array<Promise<void>> = []

    Object.keys(collectorKeys).forEach((key) => {
      switch (key) {
        case 'tokens':
          promises.push(
            this.captureTokenFileMetrics(accumulator, instrumentedPackage, tokenImportMatchers)
          )
          break
        case 'functions':
          promises.push(
            this.captureFunctionFileMetrics(
              accumulator,
              instrumentedPackage,
              functionImportMatchers
            )
          )
          break
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Generates metrics for all discovered instrumented js tokens found
   * and stored in the given accumulator.
   *
   * @param accumulator - Accumulator containing all previously computed imports and tokens.
   * @param instrumentedPackage - Name and version of the instrumented package
   * to capture metrics for.
   * @param importMatchers - Matchers instances to use for import-token matching.
   */
  async captureTokenFileMetrics(
    accumulator: JsFunctionTokenAccumulator,
    instrumentedPackage: PackageData,
    importMatchers: JsImportMatcher<JsToken>[]
  ) {
    this.resolveTokenImports(accumulator, importMatchers)

    accumulator.tokens.forEach((jsToken) => {
      const jsImport = accumulator.tokenImports.get(jsToken)

      if (jsImport === undefined) {
        return
      }

      this.capture(new TokenMetric(jsToken, jsImport, instrumentedPackage, this.logger))
    })
  }

  /**
   * Generates metrics for all discovered instrumented js functions found
   * and stored in the given accumulator.
   *
   * @param accumulator - Accumulator containing all previously computed imports and functions.
   * @param instrumentedPackage - Name and version of the instrumented package
   * to capture metrics for.
   * @param importMatchers - Matchers instances to use for import-function matching.
   */
  async captureFunctionFileMetrics(
    accumulator: JsFunctionTokenAccumulator,
    instrumentedPackage: PackageData,
    importMatchers: JsImportMatcher<JsFunction>[]
  ) {
    this.resolveFunctionImports(accumulator, importMatchers)

    accumulator.functions.forEach((jsFunction) => {
      const jsImport = accumulator.functionImports.get(jsFunction)

      if (jsImport === undefined) {
        return
      }

      this.capture(
        new FunctionMetric(jsFunction, jsImport, instrumentedPackage, this.config, this.logger)
      )
    })
  }

  resolveTokenImports(
    accumulator: JsFunctionTokenAccumulator,
    tokenMatchers: JsImportMatcher<JsToken>[]
  ) {
    accumulator.tokens.forEach((jsToken) => {
      const jsImport = tokenMatchers
        .map((tokenMatcher) => tokenMatcher.findMatch(jsToken, accumulator.imports))
        .find((jsImport) => jsImport !== undefined)

      if (jsImport === undefined) {
        return
      }

      accumulator.tokenImports.set(jsToken, jsImport)
    })
  }

  resolveFunctionImports(
    accumulator: JsFunctionTokenAccumulator,
    functionMatchers: JsImportMatcher<JsFunction>[]
  ) {
    accumulator.functions.forEach((jsFunction) => {
      const jsImport = functionMatchers
        .map((functionMatcher) => functionMatcher.findMatch(jsFunction, accumulator.imports))
        .find((jsImport) => jsImport !== undefined)

      if (jsImport === undefined) {
        return
      }

      accumulator.functionImports.set(jsFunction, jsImport)
    })
  }

  /**
   * **For testing purposes only.**
   * Makes the JsxScope collection run "synchronously" (one source file at a time). Defaults to
   * `false`.
   *
   * @param runSync - Boolean of whether or not to run synchronously.
   */
  setRunSync(runSync: boolean) {
    this.runSync = runSync
  }
}
