/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it, vi } from 'vitest'

import { type Logger } from '../../main/core/log/logger.js'
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
      public name = 'ExtendedScope'

      // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- TODOASKJOE
      constructor() {
        super()
      }

      public override async run() {
        this.capture(new ExtendedScopeMetric())
      }
    }

    const scope = new ExtendedScope()

    await scope.run()

    // TODO: write this assertion when scope is finished being implemented
    expect(true).toBeTruthy()
  })
})
