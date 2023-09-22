/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { createLogFilePath } from '../main/core/log/create-log-file-path.js'
import { Logger } from '../main/core/log/logger.js'
import { UnknownScopeError } from '../main/exceptions/unknown-scope-error.js'
import { TelemetryCollector } from '../main/telemetry-collector.js'
import { type Schema } from '../schemas/Schema.js'

const logger = new Logger(await createLogFilePath(new Date().toISOString()))

describe('telemetryCollector', () => {
  describe('runScopes', () => {
    it('does not throw when existing scopes are specified in the config', async () => {
      const telemetryCollector = new TelemetryCollector('', '', logger)

      const promises = telemetryCollector.runScopes('', '', {
        projectId: 'asdf',
        version: 1,
        collect: { npm: { dependencies: null } }
      })

      expect(promises).toHaveLength(1)

      await Promise.allSettled(promises)
    })
  })

  it('throws when unknown scopes are encountered in the config', async () => {
    const telemetryCollector = new TelemetryCollector('', '', logger)

    expect(() =>
      telemetryCollector.runScopes('', '', {
        projectId: 'asdf',
        version: 1,
        collect: { notARealScope: null }
      } as unknown as Schema)
    ).toThrow(UnknownScopeError)
  })
})
