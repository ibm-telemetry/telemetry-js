/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { hash } from '../../../main/core/anonymize/hash.js'

describe('anonymize', () => {
  it('retains data when its key is not provided', () => {
    const result = hash({ noTouch: 'keep me!', hi: 'wow' }, ['hi'])

    expect(result).toMatchObject({ noTouch: 'keep me!' })
  })

  it('hashes a value when its key is provided', () => {
    const result = hash({ hashMe: 'i better be hashed!' }, ['hashMe'])

    expect(result).toMatchObject({
      // This is the sha256 hash of "i better be hashed!"
      hashMe: 'bdbf37e7035d0472a6f5d6fb94cae59a3244111a9afe29d4e77538257c7551a8'
    })
  })

  it('does not modify a number value', () => {
    const result = hash({ dollars: 999 }, ['dollars'])

    expect(result).toMatchObject({ dollars: 999 })
  })
})
