/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { afterAll, describe, expect, it } from 'vitest'

import { createLogFilePath } from '../../../main/core/log/create-log-file-path.js'
import { Logger } from '../../../main/core/log/logger.js'
import { runCommand } from '../../../main/core/run-command.js'
import { findNestedDeps } from '../../../main/scopes/npm/find-nested-deps.js'
import { Fixture } from '../../__utils/fixture.js'

const logger = new Logger(await createLogFilePath(new Date().toISOString()))

const testDependencyTree = await new Fixture('dependency-trees/basic-dependency-tree.json').parse()

describe('findNestedDeps', () => {
  afterAll(async () => {
    await logger.close()
  })

  it('returns empty array if there are no matches', () => {
    expect(findNestedDeps(testDependencyTree, 'not-there', '1.0.0')).toStrictEqual([])
  })

  it('returns for a single match', () => {
    expect(findNestedDeps(testDependencyTree, 'two', '1.0.0')).toStrictEqual([
      ['dependencies', 'two']
    ])
  })

  it('returns for multiple matches', () => {
    expect(findNestedDeps(testDependencyTree, 'three', '1.0.0')).toStrictEqual([
      ['dependencies', 'three'],
      ['dependencies', 'two', 'dependencies', 'three']
    ])
  })

  it('only picks up correct version', () => {
    expect(findNestedDeps(testDependencyTree, 'four', '1.0.1')).toStrictEqual([
      ['dependencies', 'two', 'dependencies', 'three', 'dependencies', 'four']
    ])
  })

  it('disregards other versions', () => {
    expect(findNestedDeps(testDependencyTree, 'four', 'not-there')).toStrictEqual([])
  })

  it("finds a deeply nested dependency's entire path", async () => {
    const fixture = new Fixture('projects/complex-nesting-thingy')

    const lsAllResult = await runCommand(
      'npm ls --all --json',
      logger,
      { cwd: fixture.path },
      false
    )

    const dependencyTree = JSON.parse(lsAllResult.stdout)

    const nestedDeps = findNestedDeps(dependencyTree, 'instrumented', '1.0.0')

    expect(nestedDeps[0]).toMatchObject([
      'dependencies',
      'package3',
      'dependencies',
      'intermediate',
      'dependencies',
      'instrumented'
    ])
  })
})
