/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { createLogFilePath } from '../../../main/core/log/create-log-file-path.js'
import { Logger } from '../../../main/core/log/logger.js'
import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import { NpmScope } from '../../../main/scopes/npm/npm-scope.js'
import { type Schema as Config } from '../../../schemas/Schema.js'
import { Fixture } from '../../__utils/fixture.js'
import { initializeOtelForTest } from '../../__utils/initialize-otel-for-test.js'

const logger = new Logger(await createLogFilePath(new Date().toISOString()))
const config: Config = { projectId: 'abc123', version: 1, collect: { npm: { dependencies: null } } }

describe('class: NpmScope', () => {
  describe('run', () => {
    it('correctly captures dependency data', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const scope = new NpmScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        { collect: { npm: { dependencies: null } }, projectId: '123', version: 1 },
        logger
      )

      const metricReader = initializeOtelForTest()

      await scope.run()

      const results = await metricReader.collect()

      expect(results).toMatchSnapshot()
    })

    it('throws EmptyCollectorError if no collector has been defined', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const scope = new NpmScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        { collect: { npm: {} }, projectId: '123', version: 1 },
        logger
      )

      await expect(scope.run()).rejects.toThrow(EmptyScopeError)
    })
  })

  describe('findInstallingPackages', () => {
    it('correctly finds installing package data', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const pkgs = await new NpmScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        config,
        logger
      ).findInstallingPackages('instrumented', '0.1.0')

      expect(pkgs).toMatchSnapshot()
    })

    it('finds no results for an unknown package', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const pkgs = await new NpmScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        config,
        logger
      ).findInstallingPackages('not-here', '0.1.0')

      expect(pkgs).toMatchSnapshot()
    })

    it('finds no results for an known package at an unknown version', async () => {
      const fixture = new Fixture('projects/basic-project/node_modules/instrumented')
      const pkgs = await new NpmScope(
        fixture.path,
        path.join(fixture.path, '..', '..'),
        config,
        logger
      ).findInstallingPackages('instrumented', '0.3.0')

      expect(pkgs).toMatchSnapshot()
    })
  })
})
