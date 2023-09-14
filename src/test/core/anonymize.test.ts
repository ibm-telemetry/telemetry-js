/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { anonymize } from '../../main/core/anonymize.js'

describe('anonymize', () => {
  it('retains data when no keys are provided', () => {
    const result = anonymize({ noTouch: 'keep me!' }, { hash: [] })

    expect(result).toMatchObject({ noTouch: 'keep me!' })
  })

  it('hashes a value when its key is provided', () => {
    const result = anonymize({ hashMe: 'i better be hashed!' }, { hash: ['hashMe'] })

    expect(result).toMatchObject({
      // This is the sha256 hash of "i better be hashed!"
      hashMe: 'bdbf37e7035d0472a6f5d6fb94cae59a3244111a9afe29d4e77538257c7551a8'
    })
  })

  it('substitutes a value when its key is provided', () => {
    const result = anonymize({ subMe: 'i better be subbed!' }, { substitute: ['subMe'] })

    expect(result).toMatchObject({
      subMe: 'substituted!'
    })
  })

  it('tolerates an empty object', () => {
    expect(() => anonymize({}, { hash: [] })).not.toThrow()
  })

  it('does not modify a number value', () => {
    const result = anonymize({ dollars: 999 }, { hash: ['dollars'] })

    expect(result).toMatchObject({ dollars: 999 })
  })
})
