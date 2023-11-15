/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Attributes } from '@opentelemetry/api'
import { describe, expect, it } from 'vitest'

import { Scope } from '../../main/core/scope.js'
import { ScopeMetric } from '../../main/core/scope-metric.js'
import { initLogger } from '../__utils/init-logger.js'

describe('scope', () => {
  const logger = initLogger()

  it('correctly captures a data point', async () => {
    const myScope = new (class MyScope extends Scope {
      public override name = 'npm' as const

      /**
       * Default constructor.
       */
      public constructor() {
        super('', '', { collect: {}, projectId: '1234', version: 1 }, logger)
      }

      public override async run(): Promise<void> {
        throw new Error('Method not implemented.')
      }
    })()

    const myMetric = new (class MyMetric extends ScopeMetric {
      public override name = 'my-metric' as const

      public override get attributes(): Attributes {
        return { hello: 'hi' }
      }
    })(logger)

    expect(myScope.metrics['my-metric']).not.toBeDefined()

    myScope.capture(myMetric)

    expect(myScope.metrics['my-metric']).toBeDefined()
  })
})
