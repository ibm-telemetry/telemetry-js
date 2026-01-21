/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { afterEach, describe, expect, it } from 'vitest'

import { CdnRegistry } from '../../../main/core/cdn-registry.js'
import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import type { JsImportMatcher } from '../../../main/scopes/js/interfaces.js'
import { JsxElementRenamedImportMatcher } from '../../../main/scopes/jsx/import-matchers/jsx-element-renamed-import-matcher.js'
import type { JsxElement } from '../../../main/scopes/jsx/interfaces.js'
import { WcElementCdnImportMatcher } from '../../../main/scopes/wc/import-matchers/wc-element-cdn-import-matcher.js'
import { WcElementSideEffectImportMatcher } from '../../../main/scopes/wc/import-matchers/wc-element-side-effect-import-matcher.js'
import type { WcElement } from '../../../main/scopes/wc/interfaces.js'
import type { CdnImportMatcher } from '../../../main/scopes/wc/interfaces.js'
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
        allowedAttributeNames: ['first', 'second', 'third', 'firstProp', 'secondProp'],
        allowedAttributeStringValues: ['hi', 'wow']
      }
    }
  }
}

describe('class: WcScope', () => {
  const logger = initLogger()

  afterEach(() => {
    // Reset CDN registry after each test to ensure clean state
    CdnRegistry.reset()
  })

  describe('run', () => {
    it('correctly captures metric data for wc elements imported through a JsImport', async () => {
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

    it('correctly captures metric data for wc elements imported through a CDN', async () => {
      const metricReader = initializeOtelForTest().getMetricReader()
      const root = new Fixture('projects/web-components-project')
      const cwd = new Fixture('projects/web-components-project/node_modules/@carbon/web-components')
      const wcScope = new WcScope(cwd.path, root.path, config, logger)

      wcScope.setRunSync(true)
      await wcScope.run()

      const results = await metricReader.collect()

      clearTelemetrySdkVersion(results)
      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })

    it('captures metrics in CDN-only mode when instrumented package is NOT in node_modules', async () => {
      // This test simulates the scenario where:
      // 1. A project uses @carbon/web-components via CDN (not installed in node_modules)
      // 2. The pre-scan phase has already discovered and registered the CDN imports
      // 3. The WC scope runs in CDN-only mode to collect metrics for the CDN-imported components
      //
      // This is the key difference from the previous test: the instrumented package
      // (@carbon/web-components) is NOT installed, so it can only be detected via CDN.

      const metricReader = initializeOtelForTest().getMetricReader()
      const root = new Fixture('projects/cdn-only-project')
      const cwd = new Fixture('projects/cdn-only-project/node_modules/non-wc-package')

      // Simulate the pre-scan phase by manually populating the CDN registry
      // In production, this would be done by ChooChooTrain.preScanHtmlForCdn()
      const registry = CdnRegistry.getInstance()
      const indexHtmlPath = `${root.path}/index.html`
      const aboutHtmlPath = `${root.path}/about.html`

      // Register CDN imports from index.html (version 2.35.0 and v2/latest)
      registry.registerCdnImports(indexHtmlPath, [
        {
          name: 'button',
          path: 'https://1.www.s81c.com/common/carbon/web-components/version/v2.35.0/button.min.js',
          prefix: 'cds',
          package: '@carbon/web-components',
          version: '2.35.0'
        },
        {
          name: 'tag',
          path: 'https://1.www.s81c.com/common/carbon/web-components/version/v2.35.0/tag.min.js',
          prefix: 'cds',
          package: '@carbon/web-components',
          version: '2.35.0'
        },
        {
          name: 'accordion',
          path: 'https://1.www.s81c.com/common/carbon/web-components/tag/v2/latest/accordion.min.js',
          prefix: 'cds',
          package: '@carbon/web-components',
          version: 'v2/latest'
        }
      ])

      // Register CDN imports from about.html (version 2.40.0)
      registry.registerCdnImports(aboutHtmlPath, [
        {
          name: 'dropdown',
          path: 'https://1.www.s81c.com/common/carbon/web-components/version/v2.40.0/dropdown.min.js',
          prefix: 'cds',
          package: '@carbon/web-components',
          version: '2.40.0'
        },
        {
          name: 'modal',
          path: 'https://1.www.s81c.com/common/carbon/web-components/version/v2.40.0/modal.min.js',
          prefix: 'cds',
          package: '@carbon/web-components',
          version: '2.40.0'
        }
      ])

      // Mark pre-scan as completed and enable CDN-only mode
      // This signals to WC scope that it should process CDN imports from the registry
      registry.markPreScanCompleted()
      registry.enableCdnOnlyMode('@carbon/web-components')

      const wcScope = new WcScope(cwd.path, root.path, config, logger)
      wcScope.setRunSync(true)
      await wcScope.run()

      const results = await metricReader.collect()

      clearTelemetrySdkVersion(results)
      clearDataPointTimes(results)

      // Verify metrics were captured for CDN-only components
      const dataPoints = results.resourceMetrics.scopeMetrics[0]?.metrics[0]?.dataPoints
      expect(dataPoints).toBeDefined()
      if (dataPoints) {
        expect(dataPoints.length).toBeGreaterThan(0)

        // Verify multiple versions are captured (2.35.0, 2.40.0, and v2/latest)
        const versions = new Set(
          dataPoints
            .map((dp) => dp.attributes?.['npm.dependency.instrumented.version.raw'])
            .filter(Boolean)
        )
        expect(versions.size).toBeGreaterThanOrEqual(2) // At least 2.35.0 and 2.40.0
      }

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
      accumulator.jsImports.push(namedImport)
      accumulator.jsImports.push(renamedImport)
      accumulator.elements.push(namedElement)
      accumulator.elements.push(renamedElement)

      wcScope.resolveElementImports(
        accumulator,
        [
          new WcElementSideEffectImportMatcher(),
          new JsxElementRenamedImportMatcher()
        ] as JsImportMatcher<JsxElement | WcElement>[],
        [new WcElementCdnImportMatcher()] as CdnImportMatcher<WcElement>[]
      )

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
      accumulator.jsImports.push(namedImport)
      accumulator.jsImports.push(renamedImport)
      accumulator.elements.push(namedElement)
      accumulator.elements.push(renamedElement)
      accumulator.elements.push(unmatchedElement1)
      accumulator.elements.push(unmatchedElement2)

      const wcScope = new WcScope('', '', config, logger)
      wcScope.resolveElementImports(
        accumulator,
        [new WcElementSideEffectImportMatcher()],
        [new WcElementCdnImportMatcher()]
      )
      expect(accumulator.elementImports.get(namedElement)).toStrictEqual(namedImport)
      expect(accumulator.elementImports.get(unmatchedElement1)).toBeUndefined()
      expect(accumulator.elementImports.get(unmatchedElement2)).toBeUndefined()
    })

    it('can accept empty array', () => {
      const accumulator = new WcElementAccumulator()
      expect(() => {
        wcScope.resolveElementImports(accumulator, [], [])
      }).not.toThrow()
    })
  })
})
