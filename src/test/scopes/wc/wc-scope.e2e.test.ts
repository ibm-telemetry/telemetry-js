/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import type { JsImportMatcher } from '../../../main/scopes/js/interfaces.js'
import { JsxElementRenamedImportMatcher } from '../../../main/scopes/jsx/import-matchers/jsx-element-renamed-import-matcher.js'
import type { JsxElement } from '../../../main/scopes/jsx/interfaces.js'
import { WcElementSideEffectImportMatcher } from '../../../main/scopes/wc/import-matchers/wc-element-side-effect-import-matcher.js'
import type { WcElement } from '../../../main/scopes/wc/interfaces.js'
import { WcElementAccumulator } from '../../../main/scopes/wc/wc-element-accumulator.js'
import { WcScope } from '../../../main/scopes/wc/wc-scope.js'
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
    wc: {
      elements: {
        allowedAttributeNames: ['firstProp', 'secondProp', 'firstprop', 'secondprop'],
        allowedAttributeStringValues: ['hi', 'wow']
      }
    }
  }
}

describe('class: WcScope', () => {
  const logger = initLogger()
  describe('run', () => {
    it('correctly captures wc element metric data', async () => {
      const metricReader = initializeOtelForTest().getMetricReader()
      const root = new Fixture('projects/web-components-project')
      const cwd = new Fixture('projects/web-components-project/node_modules/instrumented')
      const wcScope = new WcScope(cwd.path, root.path, config, logger)

      wcScope.setRunSync(true)
      await wcScope.run()

      const results = await metricReader.collect()

      clearTelemetrySdkVersion(results)
      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })

    it('throws EmptyScopeError if no collector has been defined', async () => {
      const fixture = new Fixture('projects/web-components-project/node_modules/instrumented')
      const root = new Fixture('projects/web-components-project')
      const scope = new WcScope(
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

      let wcScope = new WcScope(pkgA.path, root.path, config, logger)
      wcScope.setRunSync(true)
      await wcScope.run()
      const resultsA = await metricReader.collect()

      metricReader = initializeOtelForTest().getMetricReader()

      wcScope = new WcScope(pkgB.path, root.path, config, logger)
      wcScope.setRunSync(true)
      await wcScope.run()
      const resultsB = await metricReader.collect()

      expect(resultsA.resourceMetrics.scopeMetrics[0]?.metrics[0]?.dataPoints).toHaveLength(1)
      expect(resultsB.resourceMetrics.scopeMetrics[0]?.metrics[0]?.dataPoints).toHaveLength(2)
    })

    it('captures metrics when instrumented package is installed in intermediate package', async () => {
      const metricReader = initializeOtelForTest().getMetricReader()
      const root = new Fixture('projects/hoisted-deeply-nested-deps')
      const cwd = new Fixture('projects/hoisted-deeply-nested-deps/node_modules/instrumented')
      const wcScope = new WcScope(cwd.path, root.path, config, logger)

      wcScope.setRunSync(true)
      await wcScope.run()

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
      const wcScope = new WcScope(cwd.path, root.path, config, logger)

      wcScope.setRunSync(true)
      await wcScope.run()

      const results = await metricReader.collect()

      clearTelemetrySdkVersion(results)
      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })
  })

  describe('resolveElementImports', () => {
    const wcScope = new WcScope('', '', config, logger)
    const namedImport = {
      name: 'name',
      path: 'instrumented',
      isDefault: false,
      isAll: false,
      isSideEffect: true
    }
    const renamedImport = {
      name: 'renameName',
      rename: 'rename',
      path: 'instrumented',
      isDefault: false,
      isAll: false,
      isSideEffect: true
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
      const accumulator = new WcElementAccumulator()
      accumulator.imports.push(namedImport)
      accumulator.imports.push(renamedImport)
      accumulator.elements.push(namedElement)
      accumulator.elements.push(renamedElement)

      wcScope.resolveElementImports(accumulator, [
        new WcElementSideEffectImportMatcher(),
        new JsxElementRenamedImportMatcher()
      ] as JsImportMatcher<JsxElement | WcElement>[])

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
      const accumulator = new WcElementAccumulator()
      accumulator.imports.push(namedImport)
      accumulator.imports.push(renamedImport)
      accumulator.elements.push(namedElement)
      accumulator.elements.push(renamedElement)
      accumulator.elements.push(unmatchedElement1)
      accumulator.elements.push(unmatchedElement2)

      const wcScope = new WcScope('', '', config, logger)
      wcScope.resolveElementImports(accumulator, [new WcElementSideEffectImportMatcher()])
      expect(accumulator.elementImports.get(namedElement)).toStrictEqual(namedImport)
      expect(accumulator.elementImports.get(unmatchedElement1)).toBeUndefined()
      expect(accumulator.elementImports.get(unmatchedElement2)).toBeUndefined()
    })

    it('can accept empty array', () => {
      const accumulator = new WcElementAccumulator()
      expect(() => {
        wcScope.resolveElementImports(accumulator, [])
      }).not.toThrow()
    })
  })
})
