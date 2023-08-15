/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { guardShell } from '../../main/core/guard-shell.js'

describe('guardShell', () => {
  it('does not throw with a safe command', () => {
    expect(() => {
      guardShell('echo "bla"')
    }).not.toThrow()
  })

  it('throws an error when given a backslash in a command', () => {
    expect(() => {
      guardShell('bla\\wow')
    }).toThrow(Error)
  })

  it('throws an error when given a dollar sign in a command', () => {
    expect(() => {
      guardShell('test$')
    }).toThrow(Error)
  })

  it('throws an error when given a back tick in a command', () => {
    expect(() => {
      guardShell('`bla')
    }).toThrow(Error)
  })

  it('throws an error when given a semicolon in a command', () => {
    expect(() => {
      guardShell('`bla')
    }).toThrow(Error)
  })
})
