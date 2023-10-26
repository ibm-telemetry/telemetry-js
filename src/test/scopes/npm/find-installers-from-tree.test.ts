/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { afterAll, describe, expect, it } from 'vitest'

import { createLogFilePath } from '../../../main/core/log/create-log-file-path.js'
import { Logger } from '../../../main/core/log/logger.js'
import { findInstallersFromTree } from '../../../main/scopes/npm/find-installers-from-tree.js'
import { Fixture } from '../../__utils/fixture.js'

const testDependencyTree = await new Fixture('dependency-trees/basic-dependency-tree.json').parse()
const logger = new Logger(await createLogFilePath(new Date().toISOString()))

describe('findInstallersFromTree', () => {
  afterAll(async () => {
    await logger.close()
  })

  it('returns empty array if dependency does not exist', () => {
    expect(findInstallersFromTree(testDependencyTree, 'not-there', '1.0.0', logger)).toStrictEqual(
      []
    )
  })

  it('returns for a single installer', () => {
    expect(findInstallersFromTree(testDependencyTree, 'two', '1.0.0', logger)).toMatchSnapshot()
  })

  it('returns for multiple installers', () => {
    expect(findInstallersFromTree(testDependencyTree, 'three', '1.0.0', logger)).toMatchSnapshot()
  })

  it('only picks up correct version', () => {
    expect(findInstallersFromTree(testDependencyTree, 'four', '1.0.1', logger)).toMatchSnapshot()
  })

  it('disregards other versions', () => {
    expect(findInstallersFromTree(testDependencyTree, 'four', 'not-there', logger)).toStrictEqual(
      []
    )
  })
})
