/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { runCommand } from '../../../main/core/run-command.js'
import { findNestedDeps } from '../../../main/scopes/npm/find-nested-deps.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'

const testDependencyTree = await new Fixture('dependency-trees/basic-dependency-tree.json').parse()

describe('findNestedDeps', () => {
  const logger = initLogger()

  it('returns empty array if there are no matches', () => {
    expect(
      findNestedDeps(testDependencyTree, 'not-there', ({ value }) => value.version === '1.0.0')
    ).toStrictEqual([])
  })

  it('returns for a single match', () => {
    expect(
      findNestedDeps(testDependencyTree, 'two', ({ value }) => value.version === '1.0.0')
    ).toStrictEqual([['dependencies', 'two']])
  })

  it('returns for multiple matches', () => {
    expect(
      findNestedDeps(testDependencyTree, 'three', ({ value }) => value.version === '1.0.0')
    ).toStrictEqual([
      ['dependencies', 'three'],
      ['dependencies', 'two', 'dependencies', 'three']
    ])
  })

  it('only picks up correct version', () => {
    expect(
      findNestedDeps(testDependencyTree, 'four', ({ value }) => value.version === '1.0.1')
    ).toStrictEqual([['dependencies', 'two', 'dependencies', 'three', 'dependencies', 'four']])
  })

  it('disregards other versions', () => {
    expect(
      findNestedDeps(testDependencyTree, 'four', ({ value }) => value.version === 'not-there')
    ).toStrictEqual([])
  })

  it("finds a deeply nested dependency's entire path", async () => {
    const fixture = new Fixture('projects/hoisted-deeply-nested-deps')

    const lsAllResult = await runCommand(
      'npm ls --all --json',
      logger,
      { cwd: fixture.path },
      false
    )

    const dependencyTree = JSON.parse(lsAllResult.stdout)

    const nestedDeps = findNestedDeps(
      dependencyTree,
      'instrumented',
      ({ value }) => value.version === '1.0.0'
    )

    expect(nestedDeps)

    expect(nestedDeps[0]).toMatchObject([
      'dependencies',
      'intermediate',
      'dependencies',
      'deeply-nested',
      'dependencies',
      'instrumented'
    ])
  })
})
