/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { scopeRegistry } from '../../main/scopes/scope-registry.js'

describe('scopeRegistry', () => {
  it('has all scope keys defined', () => {
    expect(scopeRegistry.npm).toBeDefined()
    expect(scopeRegistry.jsx).toBeDefined()
  })
})
