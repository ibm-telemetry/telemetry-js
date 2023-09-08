/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { getProjectRoot } from '../../../main/scopes/npm/get-project-root.js'

describe('getProjectRoot', () => {
  it('correctly gets project root', async () => {
    expect(getProjectRoot().endsWith('/telemetrics-js')).toBeTruthy()
  })
  // TODOASKJOE: is there a way to test for errors here?
})
