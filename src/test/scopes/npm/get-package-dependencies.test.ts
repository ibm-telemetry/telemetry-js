/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it, vi } from 'vitest'

import * as exec from '../../../main/core/exec.js'
import { getPackageDependencies } from '../../../main/scopes/npm/get-package-dependencies.js'

vi.spyOn(exec, 'exec').mockImplementation((cmd) => {
  switch (cmd) {
    case 'npm pkg get dependencies':
      return '{"@test/test": "^0.0.1", "test-2":"1.2.3-rc.0"}'
    case 'npm pkg get devDependencies':
      return '{"@test/test-dev": "^0.0.2", "test-dev-2":"1.2.3-rc.1"}'
    default:
      return 'should not get here'
  }
})

// this will have to be updated with every new dependency.... TODOASKJOE
describe('getPackageDependencies', () => {
  it('returns the correct base package dependencies', () => {
    expect(getPackageDependencies('base')).toStrictEqual([
      { name: '@test/test', version: '^0.0.1' },
      { name: 'test-2', version: '1.2.3-rc.0' }
    ])
  })

  it('returns the correct dev package dependencies', () => {
    expect(getPackageDependencies('dev')).toStrictEqual([
      { name: '@test/test-dev', version: '^0.0.2' },
      { name: 'test-dev-2', version: '1.2.3-rc.1' }
    ])
  })
})
