/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import { JsFunctionAllImportMatcher } from '../../../main/scopes/js/import-matchers/functions/js-function-all-import-matcher.js'
import { JsFunctionNamedImportMatcher } from '../../../main/scopes/js/import-matchers/functions/js-function-named-import-matcher.js'
import { JsFunctionRenamedImportMatcher } from '../../../main/scopes/js/import-matchers/functions/js-function-renamed-import-matcher.js'
import { JsTokenAllImportMatcher } from '../../../main/scopes/js/import-matchers/tokens/js-token-all-import-matcher.js'
import { JsTokenNamedImportMatcher } from '../../../main/scopes/js/import-matchers/tokens/js-token-named-import-matcher.js'
import { JsTokenRenamedImportMatcher } from '../../../main/scopes/js/import-matchers/tokens/js-token-renamed-import-matcher.js'
import type { JsFunction, JsImport, JsToken } from '../../../main/scopes/js/interfaces.js'
import { JsFunctionTokenAccumulator } from '../../../main/scopes/js/js-function-token-accumulator.js'
import { JsScope } from '../../../main/scopes/js/js-scope.js'
import { DEFAULT_ELEMENT_NAME } from '../../../main/scopes/jsx/constants.js'
import { JsxScope } from '../../../main/scopes/jsx/jsx-scope.js'
import { clearDataPointTimes } from '../../__utils/clear-data-point-times.js'
import { clearTelemetrySdkVersion } from '../../__utils/clear-telemetry-sdk-version.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'
import { initializeOtelForTest } from '../../__utils/initialize-otel-for-test.js'

const config: ConfigSchema = {
  projectId: 'abc123',
  version: 1,
  endpoint: '',
  collect: {
    js: {
      tokens: null,
      functions: {
        allowedArgumentStringValues: ['firstArg', 'secondArg']
      }
    }
  }
}

describe('class: JsScope', () => {
  const logger = initLogger()
  describe('run', () => {
    it('correctly captures js function and token metric data', async () => {
      const metricReader = initializeOtelForTest().getMetricReader()
      const root = new Fixture('projects/basic-project')
      const cwd = new Fixture('projects/basic-project/node_modules/instrumented')
      const jsScope = new JsScope(cwd.path, root.path, config, logger)

      jsScope.setRunSync(true)
      await jsScope.run()

      const results = await metricReader.collect()

      clearTelemetrySdkVersion(results)
      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })

    it('throws EmptyScopeError if no collector has been defined', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const root = new Fixture('projects/basic-project')
      const scope = new JsScope(
        fixture.path,
        root.path,
        { collect: { npm: {} }, projectId: '123', version: 1, endpoint: '' },
        logger
      )

      scope.setRunSync(true)
      await expect(scope.run()).rejects.toThrow(EmptyScopeError)
    })

    it.todo('only captures metrics for the instrumented package/version', async () => {
      let metricReader = initializeOtelForTest().getMetricReader()
      const root = new Fixture('projects/multiple-versions-of-instrumented-dep')
      const pkgA = new Fixture(
        'projects/multiple-versions-of-instrumented-dep/node_modules/instrumented'
      )
      const pkgB = new Fixture(
        'projects/multiple-versions-of-instrumented-dep/b/node_modules/instrumented'
      )

      let jsxScope = new JsxScope(pkgA.path, root.path, config, logger)
      jsxScope.setRunSync(true)
      await jsxScope.run()
      const resultsA = await metricReader.collect()

      metricReader = initializeOtelForTest().getMetricReader()

      jsxScope = new JsxScope(pkgB.path, root.path, config, logger)
      jsxScope.setRunSync(true)
      await jsxScope.run()
      const resultsB = await metricReader.collect()

      expect(resultsA.resourceMetrics.scopeMetrics[0]?.metrics[0]?.dataPoints).toHaveLength(1)
      expect(resultsB.resourceMetrics.scopeMetrics[0]?.metrics[0]?.dataPoints).toHaveLength(2)
    })

    it.todo(
      'captures metrics when instrumented package is installed in intermediate package',
      async () => {
        const metricReader = initializeOtelForTest().getMetricReader()
        const root = new Fixture('projects/hoisted-deeply-nested-deps')
        const cwd = new Fixture('projects/hoisted-deeply-nested-deps/node_modules/instrumented')
        const jsxScope = new JsxScope(cwd.path, root.path, config, logger)

        jsxScope.setRunSync(true)
        await jsxScope.run()

        const results = await metricReader.collect()

        clearTelemetrySdkVersion(results)
        clearDataPointTimes(results)

        expect(results).toMatchSnapshot()
      }
    )

    it.todo(
      'captures metrics for workspace files when instrumented package is installed by root package',
      async () => {
        const metricReader = initializeOtelForTest().getMetricReader()
        const root = new Fixture('projects/workspace-files-governed-by-root-dep')
        const cwd = new Fixture(
          'projects/workspace-files-governed-by-root-dep/node_modules/instrumented-top-level'
        )
        const jsxScope = new JsxScope(cwd.path, root.path, config, logger)

        jsxScope.setRunSync(true)
        await jsxScope.run()

        const results = await metricReader.collect()

        clearTelemetrySdkVersion(results)
        clearDataPointTimes(results)

        expect(results).toMatchSnapshot()
      }
    )
  })

  describe('resolveTokenImports', () => {
    const jsScope = new JsScope('', '', config, logger)
    const defaultImport: JsImport = {
      name: DEFAULT_ELEMENT_NAME,
      rename: 'nameDefault',
      path: 'instrumented',
      isDefault: true,
      isAll: false
    }
    const allImport: JsImport = {
      name: 'all',
      path: 'instrumented',
      isDefault: false,
      isAll: true
    }
    const namedImport: JsImport = {
      name: 'name',
      path: 'instrumented',
      isDefault: false,
      isAll: false
    }
    const renamedImport: JsImport = {
      name: 'renameName',
      rename: 'rename',
      path: 'instrumented',
      isDefault: false,
      isAll: false
    }
    const defaultToken: JsToken = {
      name: 'nameDefault',
      accessPath: ['object', 'nameDefault']
    }
    const allToken: JsToken = {
      name: 'whatever',
      accessPath: ['all', 'whatever']
    }
    const namedToken: JsToken = {
      name: 'name',
      accessPath: ['object', 'name']
    }
    const renamedToken: JsToken = {
      name: 'rename',
      accessPath: ['rename']
    }

    it('correctly identifies tokens with their matchers', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      accumulator.imports.push(defaultImport)
      accumulator.imports.push(allImport)
      accumulator.imports.push(namedImport)
      accumulator.imports.push(renamedImport)
      accumulator.tokens.push(defaultToken)
      accumulator.tokens.push(allToken)
      accumulator.tokens.push(namedToken)
      accumulator.tokens.push(renamedToken)

      jsScope.resolveTokenImports(accumulator, [
        new JsTokenAllImportMatcher(),
        new JsTokenNamedImportMatcher(),
        new JsTokenRenamedImportMatcher()
      ])

      expect(accumulator.tokenImports.get(defaultToken)).toStrictEqual(defaultImport)
      expect(accumulator.tokenImports.get(allToken)).toStrictEqual(allImport)
      expect(accumulator.tokenImports.get(namedToken)).toStrictEqual(namedImport)
      expect(accumulator.tokenImports.get(renamedToken)).toStrictEqual(renamedImport)
    })

    it('discards tokens that do not have a matcher', () => {
      const unmatchedToken1: JsToken = {
        name: 'noMatch1',
        accessPath: ['noMatch1']
      }
      const unmatchedToken2: JsToken = {
        name: 'noMatch2',
        accessPath: ['bla', 'noMatch2']
      }
      const accumulator = new JsFunctionTokenAccumulator()
      accumulator.imports.push(defaultImport)
      accumulator.imports.push(allImport)
      accumulator.imports.push(namedImport)
      accumulator.imports.push(renamedImport)
      accumulator.tokens.push(defaultToken)
      accumulator.tokens.push(namedToken)
      accumulator.tokens.push(renamedToken)
      accumulator.tokens.push(unmatchedToken1)
      accumulator.tokens.push(unmatchedToken2)

      const jsScope = new JsScope('', '', config, logger)
      jsScope.resolveTokenImports(accumulator, [
        new JsTokenAllImportMatcher(),
        new JsTokenNamedImportMatcher(),
        new JsTokenRenamedImportMatcher()
      ])

      expect(accumulator.tokenImports.get(defaultToken)).toStrictEqual(defaultImport)
      expect(accumulator.tokenImports.get(namedToken)).toStrictEqual(namedImport)
      expect(accumulator.tokenImports.get(renamedToken)).toStrictEqual(renamedImport)
      expect(accumulator.tokenImports.get(unmatchedToken1)).toBeUndefined()
      expect(accumulator.tokenImports.get(unmatchedToken2)).toBeUndefined()
    })

    it('can accept empty array', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      expect(() => {
        jsScope.resolveTokenImports(accumulator, [])
      }).not.toThrow()
    })
  })

  describe('resolveFunctionImports', () => {
    const jsScope = new JsScope('', '', config, logger)
    const defaultImport: JsImport = {
      name: DEFAULT_ELEMENT_NAME,
      rename: 'nameDefault',
      path: 'instrumented',
      isDefault: true,
      isAll: false
    }
    const allImport: JsImport = {
      name: 'all',
      path: 'instrumented',
      isDefault: false,
      isAll: true
    }
    const namedImport: JsImport = {
      name: 'name',
      path: 'instrumented',
      isDefault: false,
      isAll: false
    }
    const renamedImport: JsImport = {
      name: 'renameName',
      rename: 'rename',
      path: 'instrumented',
      isDefault: false,
      isAll: false
    }
    const defaultFunction: JsFunction = {
      name: 'functionName',
      accessPath: ['nameDefault', 'functionName'],
      arguments: [],
      startPos: 0,
      endPos: 0
    }
    const allFunction: JsFunction = {
      name: 'whatever',
      accessPath: ['all', 'whatever'],
      arguments: [],
      startPos: 0,
      endPos: 0
    }
    const namedFunction: JsFunction = {
      name: 'name',
      accessPath: ['name'],
      arguments: [],
      startPos: 0,
      endPos: 0
    }
    const renamedFunction: JsFunction = {
      name: 'rename',
      accessPath: ['rename'],
      arguments: [],
      startPos: 0,
      endPos: 0
    }

    it('correctly identifies functions with their matchers', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      accumulator.imports.push(defaultImport)
      accumulator.imports.push(allImport)
      accumulator.imports.push(namedImport)
      accumulator.imports.push(renamedImport)
      accumulator.functions.push(defaultFunction)
      accumulator.functions.push(allFunction)
      accumulator.functions.push(namedFunction)
      accumulator.functions.push(renamedFunction)

      jsScope.resolveFunctionImports(accumulator, [
        new JsFunctionAllImportMatcher(),
        new JsFunctionNamedImportMatcher(),
        new JsFunctionRenamedImportMatcher()
      ])

      expect(accumulator.functionImports.get(defaultFunction)).toStrictEqual(defaultImport)
      expect(accumulator.functionImports.get(allFunction)).toStrictEqual(allImport)
      expect(accumulator.functionImports.get(namedFunction)).toStrictEqual(namedImport)
      expect(accumulator.functionImports.get(renamedFunction)).toStrictEqual(renamedImport)
    })

    it('discards functions that do not have a matcher', () => {
      const unmatchedFunction1: JsFunction = {
        name: 'noMatch1',
        accessPath: ['obj', 'noMatch1'],
        arguments: [],
        startPos: 0,
        endPos: 0
      }
      const unmatchedFunction2: JsFunction = {
        name: 'noMatch2',
        accessPath: ['noMatch2'],
        arguments: [],
        startPos: 0,
        endPos: 0
      }
      const accumulator = new JsFunctionTokenAccumulator()
      accumulator.imports.push(defaultImport)
      accumulator.imports.push(allImport)
      accumulator.imports.push(namedImport)
      accumulator.imports.push(renamedImport)
      accumulator.functions.push(defaultFunction)
      accumulator.functions.push(namedFunction)
      accumulator.functions.push(renamedFunction)
      accumulator.functions.push(unmatchedFunction1)
      accumulator.functions.push(unmatchedFunction2)

      const jsScope = new JsScope('', '', config, logger)
      jsScope.resolveFunctionImports(accumulator, [
        new JsFunctionAllImportMatcher(),
        new JsFunctionNamedImportMatcher(),
        new JsFunctionRenamedImportMatcher()
      ])

      expect(accumulator.functionImports.get(defaultFunction)).toStrictEqual(defaultImport)
      expect(accumulator.functionImports.get(namedFunction)).toStrictEqual(namedImport)
      expect(accumulator.functionImports.get(renamedFunction)).toStrictEqual(renamedImport)
      expect(accumulator.functionImports.get(unmatchedFunction1)).toBeUndefined()
      expect(accumulator.functionImports.get(unmatchedFunction2)).toBeUndefined()
    })

    it('can accept empty array', () => {
      const accumulator = new JsFunctionTokenAccumulator()
      expect(() => {
        jsScope.resolveTokenImports(accumulator, [])
      }).not.toThrow()
    })
  })
})