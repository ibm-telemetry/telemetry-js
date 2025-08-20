/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest'

import { removeIrrelevantImports } from '../../../main/scopes/js/remove-irrelevant-imports.js'
import { JsxElementAccumulator } from '../../../main/scopes/jsx/jsx-element-accumulator.js'

describe('removeIrrelevantImports', () => {
  it('correctly removes unwanted imports', () => {
    const accumulator = new JsxElementAccumulator()
    accumulator.jsImports.push({
      name: 'name',
      path: 'path',
      isDefault: false,
      isAll: false
    })
    accumulator.jsImports.push({
      name: 'name',
      path: 'instrumented',
      isDefault: true,
      isAll: false
    })
    accumulator.jsImports.push({
      name: 'name',
      path: 'instrumented/bla',
      isDefault: false,
      isAll: true
    })
    expect(accumulator.jsImports).toHaveLength(3)
    removeIrrelevantImports(accumulator, 'instrumented')
    expect(accumulator.jsImports).toHaveLength(2)
  })

  it('removes all imports if no imports match instrumented package', () => {
    const accumulator = new JsxElementAccumulator()
    accumulator.jsImports.push({
      name: 'name',
      path: 'path',
      isDefault: false,
      isAll: false
    })
    accumulator.jsImports.push({
      name: 'name',
      path: 'not-instrumented',
      isDefault: true,
      isAll: false
    })
    accumulator.jsImports.push({
      name: 'name',
      path: 'not-instrumented/bla',
      isDefault: false,
      isAll: true
    })
    expect(accumulator.jsImports).toHaveLength(3)
    removeIrrelevantImports(accumulator, 'instrumented')
    expect(accumulator.jsImports).toHaveLength(0)
  })

  it("does not remove imports if there aren't any to remove", () => {
    const accumulator = new JsxElementAccumulator()
    accumulator.jsImports.push({
      name: 'name',
      path: 'instrumented/1',
      isDefault: false,
      isAll: false
    })
    accumulator.jsImports.push({
      name: 'name',
      path: 'instrumented',
      isDefault: true,
      isAll: false
    })
    accumulator.jsImports.push({
      name: 'name',
      path: 'instrumented/bla',
      isDefault: false,
      isAll: true
    })
    expect(accumulator.jsImports).toHaveLength(3)
    removeIrrelevantImports(accumulator, 'instrumented')
    expect(accumulator.jsImports).toHaveLength(3)
  })

  it('can accept empty array', () => {
    const accumulator = new JsxElementAccumulator()
    expect(accumulator.jsImports).toHaveLength(0)
    removeIrrelevantImports(accumulator, 'instrumented')
    expect(accumulator.jsImports).toHaveLength(0)
  })
})
