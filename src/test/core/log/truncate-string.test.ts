/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { truncateString } from '../../../main/core/log/truncate-string.js'

describe('truncateString', () => {
  it('truncates a long string', () => {
    let longString = ''
    for (let i = 0; i < 500; i++) {
      longString += 'a'
    }

    const result = truncateString(longString, 499)

    expect(result.endsWith('... (truncated)')).toBeTruthy()
  })

  it('does not truncate a string smaller than the limit', () => {
    const shortString = '12345'

    expect(truncateString(shortString, 6)).toStrictEqual(shortString)
  })
})
