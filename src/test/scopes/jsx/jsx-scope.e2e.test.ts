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
import { getPackageJsonTree } from '../../../main/scopes/jsx/get-package-json-tree.js'
import { getTrackedSourceFiles } from '../../../main/scopes/jsx/get-tracked-source-files.js'
import { AllImportMatcher } from '../../../main/scopes/jsx/import-matchers/all-import-matcher.js'
import { NamedImportMatcher } from '../../../main/scopes/jsx/import-matchers/named-import-matcher.js'
import { RenamedImportMatcher } from '../../../main/scopes/jsx/import-matchers/renamed-import-matcher.js'
import { JsxElementAccumulator } from '../../../main/scopes/jsx/jsx-element-accumulator.js'
import { JsxScope } from '../../../main/scopes/jsx/jsx-scope.js'
import { clearDataPointTimes } from '../../__utils/clear-data-point-times.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'
import { initializeOtelForTest } from '../../__utils/initialize-otel-for-test.js'

const config: ConfigSchema = {
  projectId: 'abc123',
  version: 1,
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
      const metricReader = initializeOtelForTest()
      const root = new Fixture(path.join('projects', 'basic-project'))
      const cwd = new Fixture(
        path.join('projects', 'basic-project', 'node_modules', 'instrumented')
      )
      const jsxScope = new JsxScope(cwd.path, root.path, config, logger)

      await jsxScope.run()

      const results = await metricReader.collect()

      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })

    it('throws EmptyScopeError if no collector has been defined', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const scope = new JsxScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        { collect: { npm: {} }, projectId: '123', version: 1 },
        logger
      )

      await expect(scope.run()).rejects.toThrow(EmptyScopeError)
    })
  })

  describe('parseFile', () => {
    const fixture = new Fixture('projects/basic-project/test.jsx')
    const root = new Fixture(path.join('projects', 'basic-project'))
    const jsxScope = new JsxScope(fixture.path, root.path, config, logger)
    it('correctly detects imports and elements in a given file', async () => {
      const accumulator = new JsxElementAccumulator()
      const sourceFile = (await getTrackedSourceFiles(fixture.path, logger))[0] as ts.SourceFile

      jsxScope.parseFile(accumulator, sourceFile)
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
      expect(accumulator.elementImports.get(unmatchedElement1)).toStrictEqual(undefined)
      expect(accumulator.elementImports.get(unmatchedElement2)).toStrictEqual(undefined)
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
    it('correctly sets invoker name for elements', async () => {
      const root = new Fixture('projects/basic-project')
      const fileName = new Fixture('projects/basic-project/test.jsx')
      const packageJsonTree = await getPackageJsonTree(root.path, logger)
      const accumulator = new JsxElementAccumulator()
      accumulator.elements.push(element1)
      accumulator.elements.push(element2)

      await jsxScope.resolveInvokers(accumulator, fileName.path, packageJsonTree)

      expect(accumulator.elementInvokers.get(element1)).toStrictEqual('basic-project')
      expect(accumulator.elementInvokers.get(element2)).toStrictEqual('basic-project')
    })
    it('does not add an entry if filename package cannot be found', async () => {
      const fileName = new Fixture('projects/basic-project/test.jsx')
      const accumulator = new JsxElementAccumulator()
      accumulator.elements.push(element1)
      accumulator.elements.push(element2)

      await jsxScope.resolveInvokers(accumulator, fileName.path, [])

      expect(accumulator.elementInvokers.get(element1)).toBeUndefined()
      expect(accumulator.elementInvokers.get(element2)).toBeUndefined()
    })
  })
})
