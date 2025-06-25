/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import { DEFAULT_ELEMENT_NAME } from '../../../main/scopes/jsx/constants.js'
import { JsxElementAllImportMatcher } from '../../../main/scopes/jsx/import-matchers/jsx-element-all-import-matcher.js'
import { JsxElementNamedImportMatcher } from '../../../main/scopes/jsx/import-matchers/jsx-element-named-import-matcher.js'
import { JsxElementRenamedImportMatcher } from '../../../main/scopes/jsx/import-matchers/jsx-element-renamed-import-matcher.js'
import { JsxElementAccumulator } from '../../../main/scopes/jsx/jsx-element-accumulator.js'
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
    jsx: {
      elements: {
        allowedAttributeNames: ['firstProp', 'secondProp'],
        allowedAttributeStringValues: ['hi', 'wow']
      }
    }
  }
}

describe('class: JsxScope', () => {
  const logger = initLogger()
  describe('run', () => {
    it('correctly captures jsx element metric data', async () => {
      const metricReader = initializeOtelForTest().getMetricReader()
      const root = new Fixture('projects/basic-project')
      const cwd = new Fixture('projects/basic-project/node_modules/instrumented')
      const jsxScope = new JsxScope(cwd.path, root.path, config, logger)

      jsxScope.setRunSync(true)
      await jsxScope.run()

      const results = await metricReader.collect()

      clearTelemetrySdkVersion(results)
      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })

    it('throws EmptyScopeError if no collector has been defined', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const root = new Fixture('projects/basic-project')
      const scope = new JsxScope(
        fixture.path,
        root.path,
        { collect: { npm: {} }, projectId: '123', version: 1, endpoint: '' },
        logger
      )

      scope.setRunSync(true)
      await expect(scope.run()).rejects.toThrow(EmptyScopeError)
    })

    it('only captures metrics for the instrumented package/version', async () => {
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

    it('captures metrics when instrumented package is installed in intermediate package', async () => {
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
    })

    it('captures metrics for workspace files when instrumented package is installed by root package', async () => {
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
    })
  })

  describe('resolveElementImports', () => {
    const jsxScope = new JsxScope('', '', config, logger)
    const defaultImport = {
      name: DEFAULT_ELEMENT_NAME,
      rename: 'nameDefault',
      path: 'instrumented',
      isDefault: true,
      isAll: false
    }
    const allImport = {
      name: 'all',
      path: 'instrumented',
      isDefault: false,
      isAll: true
    }
    const namedImport = {
      name: 'name',
      path: 'instrumented',
      isDefault: false,
      isAll: false
    }
    const renamedImport = {
      name: 'renameName',
      rename: 'rename',
      path: 'instrumented',
      isDefault: false,
      isAll: false
    }
    const defaultElement = {
      name: 'nameDefault',
      prefix: undefined,
      raw: '',
      attributes: []
    }
    const allElement = {
      name: 'whatever',
      prefix: 'all',
      raw: '',
      attributes: []
    }
    const namedElement = {
      name: 'name',
      prefix: undefined,
      raw: '',
      attributes: []
    }
    const renamedElement = {
      name: 'rename',
      prefix: undefined,
      raw: '',
      attributes: []
    }

    it('correctly identifies elements with their matchers', () => {
      const accumulator = new JsxElementAccumulator()
      accumulator.imports.push(defaultImport)
      accumulator.imports.push(allImport)
      accumulator.imports.push(namedImport)
      accumulator.imports.push(renamedImport)
      accumulator.elements.push(defaultElement)
      accumulator.elements.push(allElement)
      accumulator.elements.push(namedElement)
      accumulator.elements.push(renamedElement)

      jsxScope.resolveElementImports(accumulator, [
        new JsxElementAllImportMatcher(),
        new JsxElementNamedImportMatcher(),
        new JsxElementRenamedImportMatcher()
      ])

      expect(accumulator.elementImports.get(defaultElement)).toStrictEqual(defaultImport)
      expect(accumulator.elementImports.get(allElement)).toStrictEqual(allImport)
      expect(accumulator.elementImports.get(namedElement)).toStrictEqual(namedImport)
      expect(accumulator.elementImports.get(renamedElement)).toStrictEqual(renamedImport)
    })

    it('discards elements that do not have a matcher', () => {
      const unmatchedElement1 = {
        name: 'noMatch1',
        prefix: undefined,
        raw: '',
        attributes: []
      }
      const unmatchedElement2 = {
        name: 'noMatch2',
        prefix: undefined,
        raw: '',
        attributes: []
      }
      const accumulator = new JsxElementAccumulator()
      accumulator.imports.push(defaultImport)
      accumulator.imports.push(allImport)
      accumulator.imports.push(namedImport)
      accumulator.imports.push(renamedImport)
      accumulator.elements.push(defaultElement)
      accumulator.elements.push(namedElement)
      accumulator.elements.push(renamedElement)
      accumulator.elements.push(unmatchedElement1)
      accumulator.elements.push(unmatchedElement2)

      const jsxScope = new JsxScope('', '', config, logger)
      jsxScope.resolveElementImports(accumulator, [
        new JsxElementAllImportMatcher(),
        new JsxElementNamedImportMatcher(),
        new JsxElementRenamedImportMatcher()
      ])

      expect(accumulator.elementImports.get(defaultElement)).toStrictEqual(defaultImport)
      expect(accumulator.elementImports.get(namedElement)).toStrictEqual(namedImport)
      expect(accumulator.elementImports.get(renamedElement)).toStrictEqual(renamedImport)
      expect(accumulator.elementImports.get(unmatchedElement1)).toBeUndefined()
      expect(accumulator.elementImports.get(unmatchedElement2)).toBeUndefined()
    })

    it('can accept empty array', () => {
      const accumulator = new JsxElementAccumulator()
      expect(() => {
        jsxScope.resolveElementImports(accumulator, [])
      }).not.toThrow()
    })
  })
})
