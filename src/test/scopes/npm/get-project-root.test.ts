/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it, vi } from 'vitest'

import * as exec from '../../../main/core/exec.js'
import { NoProjectRootError } from '../../../main/exceptions/no-project-root-error.js'
import { getProjectRoot } from '../../../main/scopes/npm/get-project-root.js'

describe('getProjectRoot', () => {
  it('correctly gets project root', async () => {
    await expect(getProjectRoot()).resolves.toMatch(/.*\/telemetrics-js/)
  })

  it('throws error if no root exists', async () => {
    vi.spyOn(exec, 'exec').mockImplementation(async () => {
      throw new Error()
    })
    await expect(getProjectRoot()).rejects.toThrow(NoProjectRootError)
  })
})
