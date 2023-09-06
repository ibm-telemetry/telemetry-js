/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it, vi } from 'vitest'

import * as exec from '../../../main/core/exec.js'
import { getPackageDependencies } from '../../../main/scopes/npm/old/get-package-dependencies.js'

vi.spyOn(exec, 'exec').mockReturnValue(
  '{"dependencies": {"@test/test": {"version": "0.0.1"}, "test-2":{"version": "1.2.3-rc.0"}}}'
)

// this will have to be updated with every new dependency.... TODOASKJOE
describe('getPackageDependencies', () => {
  it('returns the correct base package dependencies', () => {
    expect(getPackageDependencies()).toStrictEqual([
      { name: '@test/test', version: '0.0.1' },
      { name: 'test-2', version: '1.2.3-rc.0' }
    ])
  })
})
