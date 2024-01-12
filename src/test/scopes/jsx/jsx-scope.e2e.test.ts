/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import type * as ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import { AllImportMatcher } from '../../../main/scopes/jsx/import-matchers/all-import-matcher.js'
import { NamedImportMatcher } from '../../../main/scopes/jsx/import-matchers/named-import-matcher.js'
import { RenamedImportMatcher } from '../../../main/scopes/jsx/import-matchers/renamed-import-matcher.js'
import { JsxElementAccumulator } from '../../../main/scopes/jsx/jsx-element-accumulator.js'
import { JsxScope } from '../../../main/scopes/jsx/jsx-scope.js'
import { getTrackedSourceFiles } from '../../../main/scopes/jsx/utils/get-tracked-source-files.js'
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
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )
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
      const scope = new JsxScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        { collect: { npm: {} }, projectId: '123', version: 1, endpoint: '' },
        logger
      )

      scope.setRunSync(true)
      await expect(scope.run()).rejects.toThrow(EmptyScopeError)
    })

    it('only captures metrics for the instrumented package/version', async () => {
      let metricReader = initializeOtelForTest().getMetricReader()
      const root = new Fixture(path.join('projects', 'multiple-versions-of-instrumented-dep'))
      const pkgA = new Fixture(
        path.join(
          'projects',
          'multiple-versions-of-instrumented-dep',
          'node_modules',
          'instrumented'
        )
      )
      const pkgB = new Fixture(
        path.join(
          'projects',
          'multiple-versions-of-instrumented-dep',
          'b',
          'node_modules',
          'instrumented'
        )
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
  })

  describe('parseFile', () => {
    const fixture = new Fixture('projects/basic-project/test.jsx')
    const root = new Fixture(path.join('projects', 'basic-project'))
    const jsxScope = new JsxScope(fixture.path, root.path, config, logger)

    it('correctly detects imports and elements in a given file', async () => {
      const accumulator = new JsxElementAccumulator()
      const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile

      jsxScope.processFile(accumulator, sourceFile)
      expect(accumulator.elements).toMatchSnapshot('elements')
      expect(accumulator.imports).toMatchSnapshot('imports')
    })
  })

  describe('removeIrrelevantImports', () => {
    it('correctly removes unwanted imports', () => {
      const accumulator = new JsxElementAccumulator()
      accumulator.imports.push({
        name: 'name',
        path: 'path',
        isDefault: false,
        isAll: false
      })
      accumulator.imports.push({
        name: 'name',
        path: 'instrumented',
        isDefault: true,
        isAll: false
      })
      accumulator.imports.push({
        name: 'name',
        path: 'instrumented/bla',
        isDefault: false,
        isAll: true
      })
      expect(accumulator.imports).toHaveLength(3)
      const jsxScope = new JsxScope('', '', config, logger)
      jsxScope.removeIrrelevantImports(accumulator, 'instrumented')
      expect(accumulator.imports).toHaveLength(2)
    })

    it('removes all imports if no imports match instrumented package', () => {
      const accumulator = new JsxElementAccumulator()
      accumulator.imports.push({
        name: 'name',
        path: 'path',
        isDefault: false,
        isAll: false
      })
      accumulator.imports.push({
        name: 'name',
        path: 'not-instrumented',
        isDefault: true,
        isAll: false
      })
      accumulator.imports.push({
        name: 'name',
        path: 'not-instrumented/bla',
        isDefault: false,
        isAll: true
      })
      expect(accumulator.imports).toHaveLength(3)
      const jsxScope = new JsxScope('', '', config, logger)
      jsxScope.removeIrrelevantImports(accumulator, 'instrumented')
      expect(accumulator.imports).toHaveLength(0)
    })

    it("does not remove imports if there aren't any to remove", () => {
      const accumulator = new JsxElementAccumulator()
      accumulator.imports.push({
        name: 'name',
        path: 'instrumented/1',
        isDefault: false,
        isAll: false
      })
      accumulator.imports.push({
        name: 'name',
        path: 'instrumented',
        isDefault: true,
        isAll: false
      })
      accumulator.imports.push({
        name: 'name',
        path: 'instrumented/bla',
        isDefault: false,
        isAll: true
      })
      expect(accumulator.imports).toHaveLength(3)
      const jsxScope = new JsxScope('', '', config, logger)
      jsxScope.removeIrrelevantImports(accumulator, 'instrumented')
      expect(accumulator.imports).toHaveLength(3)
    })

    it('can accept empty array', () => {
      const accumulator = new JsxElementAccumulator()
      expect(accumulator.imports).toHaveLength(0)
      const jsxScope = new JsxScope('', '', config, logger)
      jsxScope.removeIrrelevantImports(accumulator, 'instrumented')
      expect(accumulator.imports).toHaveLength(0)
    })
  })

  describe('resolveElementImports', () => {
    const jsxScope = new JsxScope('', '', config, logger)
    const defaultImport = {
      name: '[Default]',
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
        new AllImportMatcher(),
        new NamedImportMatcher(),
        new RenamedImportMatcher()
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
        new AllImportMatcher(),
        new NamedImportMatcher(),
        new RenamedImportMatcher()
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

  describe('resolveInvokers', () => {
    const jsxScope = new JsxScope('', '', config, logger)
    const element1 = {
      name: 'elName',
      prefix: undefined,
      raw: '',
      attributes: []
    }
    const element2 = {
      name: 'elName2',
      prefix: undefined,
      raw: '',
      attributes: []
    }

    // TODO: This test currently fails because of this bug:
    // https://github.com/nodejs/node/issues/47928
    // This could be solved by mocking runCommand to return a hard-coded value, but this is less
    // than useful for an end-to-end test which strives to hit as much of the underlying
    // infrastructure as possible.
    // eslint-disable-next-line vitest/no-disabled-tests -- See above
    it.skip('correctly sets invoker name for elements', async () => {
      const fileName = new Fixture('projects/basic-project/test.jsx')
      const accumulator = new JsxElementAccumulator()
      accumulator.elements.push(element1)
      accumulator.elements.push(element2)

      await jsxScope.resolveInvokers(accumulator, fileName.path)

      expect(accumulator.elementInvokers.get(element1)).toBe('basic-project')
      expect(accumulator.elementInvokers.get(element2)).toBe('basic-project')
    })
  })
})
