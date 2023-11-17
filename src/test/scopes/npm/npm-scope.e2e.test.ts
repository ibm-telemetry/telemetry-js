/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { EmptyScopeError } from '../../../main/exceptions/empty-scope.error.js'
import { NoPackageJsonFoundError } from '../../../main/exceptions/no-package-json-found-error.js'
import { NpmScope } from '../../../main/scopes/npm/npm-scope.js'
import { clearDataPointTimes } from '../../__utils/clear-data-point-times.js'
import { Fixture } from '../../__utils/fixture.js'
import { initLogger } from '../../__utils/init-logger.js'
import { initializeOtelForTest } from '../../__utils/initialize-otel-for-test.js'

const config: ConfigSchema = {
  projectId: 'abc123',
  version: 1,
  collect: { npm: { dependencies: null } }
}

describe('class: NpmScope', () => {
  const logger = initLogger()

  describe('run', () => {
    it('correctly captures dependency data', async () => {
      const cwd = new Fixture('projects/basic-project/node_modules/instrumented')
      const root = new Fixture('projects/basic-project')

      const scope = new NpmScope(
        cwd.path,
        root.path,
        { collect: { npm: { dependencies: null } }, projectId: '123', version: 1 },
        logger
      )

      const metricReader = initializeOtelForTest()

      await scope.run()

      const results = await metricReader.collect()

      clearDataPointTimes(results)

      expect(results).toMatchSnapshot()
    })

    it('throws EmptyScopeError if no collector has been defined', async () => {
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

  it('throws an error if no package.json files were found', async () => {
    const fixture = new Fixture('projects/no-package-json-files/foo/bar')
    const scope = new NpmScope(
      fixture.path,
      path.join(fixture.path, '..', '..'),
      { collect: { npm: {} }, projectId: '123', version: 1 },
      logger
    )

    await expect(
      async () => await scope.findInstallingPackages('not-here', '0.1.0')
    ).rejects.toThrow(NoPackageJsonFoundError)
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
