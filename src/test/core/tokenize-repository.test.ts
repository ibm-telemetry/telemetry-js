/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { tokenizeRepository } from '../../main/core/tokenize-repository.js'

describe('tokenizeRepository', () => {
  it('handles a well-formed https url', () => {
    expect(tokenizeRepository('https://example.com/example-owner/example-repo.git')).toMatchObject({
      host: 'example.com',
      owner: 'example-owner',
      repository: 'example-repo'
    })
  })

  it('handles a well-formed http url', () => {
    expect(tokenizeRepository('http://example.com/example-owner/example-repo.git')).toMatchObject({
      host: 'example.com',
      owner: 'example-owner',
      repository: 'example-repo'
    })
  })

  it('handles a well-formed ssh url', () => {
    expect(tokenizeRepository('git@example.com:example-owner/example-repo.git')).toMatchObject({
      host: 'example.com',
      owner: 'example-owner',
      repository: 'example-repo'
    })
  })

  it('handles an ssh url with no .git suffix', () => {
    expect(tokenizeRepository('git@example.com:example-owner/example-repo')).toMatchObject({
      host: 'example.com',
      owner: 'example-owner',
      repository: 'example-repo'
    })
  })

  it('handles a malformed url', () => {
    expect(tokenizeRepository('oops')).toMatchObject({
      host: undefined,
      owner: undefined,
      repository: undefined
    })
  })

  it('handles an http url with no repo', () => {
    expect(tokenizeRepository('http://example.com/example-owner')).toMatchObject({
      host: undefined,
      owner: undefined,
      repository: undefined
    })
  })

  it('handles an ssh url with no repo', () => {
    expect(tokenizeRepository('git@example.com:heh')).toMatchObject({
      host: undefined,
      owner: undefined,
      repository: undefined
    })
  })
})
