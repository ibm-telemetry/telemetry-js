/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it, vi } from 'vitest'

import { type Logger } from '../../main/core/logger.js'
import { Scope } from '../../main/core/scope.js'
import { ScopeMetric } from '../../main/core/scope-metric.js'

const testLogger = {
  log: vi.fn()
}

describe('scope', () => {
  it('correctly captures dependency data', async () => {
    /**
     * Test class that implements abstract class ScopeMetric for testing purposes.
     */
    class ExtendedScopeMetric extends ScopeMetric {
      public override name = 'metric.name'

      public override get attributes() {
        return {
          test: 'test'
        }
      }
    }
    /**
     * Test class that implements abstract class Scope for testing purposes.
     */
    class ExtendedScope extends Scope {
      protected override logger = testLogger as unknown as Logger

      public override async run() {
        void this.capture(new ExtendedScopeMetric())
      }
    }

    const scope = new ExtendedScope()

    await scope.run()
    // these assertions will definitely change in the future when the capture method is
    // more well implemented in Scope
    expect(testLogger.log).toHaveBeenCalledTimes(3)
    expect(testLogger.log).toHaveBeenCalledWith('debug', 'I captured some data!')
    expect(testLogger.log).toHaveBeenCalledWith('debug', 'metric.name')
    expect(testLogger.log).toHaveBeenCalledWith('debug', '{"test":"test"}')
  })
})
