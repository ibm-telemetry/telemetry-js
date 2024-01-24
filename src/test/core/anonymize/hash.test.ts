/*
 * Copyright IBM Corp. 2023, 2024
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

  it('hashes an array value when its key is provided', () => {
    const result = hash({ ignoreMe: 'i better not be hashed!', arrayValue: ['1', '2', '3', '4'] }, [
      'arrayValue'
    ])

    expect(result).toMatchObject({
      ignoreMe: 'i better not be hashed!',
      // This is the sha256 hash of each element in the array
      arrayValue: [
        '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
        '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
        '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
      ]
    })
  })

  it('does not modify a number value', () => {
    const result = hash({ dollars: 999 }, ['dollars'])

    expect(result).toMatchObject({ dollars: 999 })
  })
})
