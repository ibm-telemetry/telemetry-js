/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { findFileRoot } from '../../../main/scopes/jsx/find-file-root.js'
import { Fixture } from '../../__utils/fixture.js'

describe('getFileRootPackage', () => {
  it('correctly returns leaf package.json for nested file', async () => {
    const fixture = new Fixture('package-json-tree.json')

    expect(
      findFileRoot('src/something/nested-1/nested-2/nested-3-2/fileName', await fixture.parse())
    ).toStrictEqual('src/something/nested-1/nested-2/nested-3-2')
  })

  it('correctly returns root package.json for top-level file', async () => {
    const fixture = new Fixture('package-json-tree.json')

    expect(findFileRoot('src/something/fileName', await fixture.parse())).toStrictEqual(
      'src/something'
    )
  })

  it('correctly returns root package.json for nested file without nested matchers', async () => {
    const fixture = new Fixture('package-json-tree.json')

    expect(
      findFileRoot('src/something/more/stuff/here/fileName', await fixture.parse())
    ).toStrictEqual('src/something')
  })

  it('correctly returns mid-level package.json for mid-nested file', async () => {
    const fixture = new Fixture('package-json-tree.json')

    expect(
      findFileRoot('src/something/nested-1/nested-2/fileName', await fixture.parse())
    ).toStrictEqual('src/something/nested-1/nested-2')
  })

  it('throws error if file is not within packageJsonTree scope', async () => {
    const fixture = new Fixture('package-json-tree.json')

    await expect(async () =>
      findFileRoot('src/fileName', await fixture.parse())
    ).resolves.toBeUndefined()
  })
})
