/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { createLogFilePath } from '../../../main/core/log/create-log-file-path.js'
import { Logger } from '../../../main/core/log/logger.js'
import { Trace } from '../../../main/core/log/trace.js'
import { LoggerNotFoundError } from '../../../main/exceptions/logger-not-found-error.js'

const testLogger = new Logger(await createLogFilePath(new Date().toISOString()))

describe('trace', () => {
  it('returns the original value', () => {
    const testTraceableMethod = (arg: string) => arg + 'hello'

    const descriptor = { value: testTraceableMethod, logger: testLogger }
    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    const input = 'its an arg!'

    expect(descriptor.value(input)).toStrictEqual(input + 'hello')
  })

  it('throws an error if no logger is defined', () => {
    const testTraceableMethod = (arg: string) => arg

    const descriptor = { value: testTraceableMethod }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    expect(() => {
      // Invoke the function
      descriptor.value('its an arg!')
    }).toThrow(LoggerNotFoundError)
  })

  it('returns early if descriptor does not have a value', () => {
    const descriptor = { value: null, logger: testLogger }

    // Decorate the function

    expect(() => {
      Trace()({}, 'testFunctionName', descriptor)
    }).not.toThrow()
  })

  it('works with a promise', async () => {
    const testTraceableMethod = async (arg: string) => await Promise.resolve(arg)

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    const input = 'its an arg!'

    await expect(descriptor.value(input)).resolves.toStrictEqual(input)
  })

  it('works with an exception', () => {
    const testTraceableMethod = (arg: string) => {
      throw new Error(arg)
    }

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    // Invoke the function
    let result: unknown
    try {
      descriptor.value('its an arg!')
    } catch (e) {
      result = e
    }

    expect(result instanceof Error).toBeTruthy()
  })

  it('works with a returned exception', () => {
    const testTraceableMethod = (arg: string) => {
      return new Error(arg)
    }

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    expect(descriptor.value('its an arg!') instanceof Error).toBeTruthy()
  })

  it('works with a promise that throws an exception', async () => {
    const testTraceableMethod = async (arg: string) => await Promise.reject(new Error(arg))

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    // Invoke the function
    let result: unknown
    try {
      await descriptor.value('its an arg!')
    } catch (e) {
      result = e
    }

    expect(result instanceof Error).toBeTruthy()
  })
  it('works with an undefined return value', () => {
    const testTraceableMethod = () => undefined

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    expect(() => {
      descriptor.value()
    }).not.toThrow()
  })

  it('works with a symbol', () => {
    const testTraceableMethod = () => Symbol('asdf')

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    // Invoke the function
    descriptor.value()
  })

  it('works with a bigint', () => {
    const testTraceableMethod = () => BigInt(123)

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    // Invoke the function
    descriptor.value()
  })

  it('preserves metadata', () => {
    const testTraceableMethod = (arg: string) => arg

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    const metadataKey = 'testing123'

    Reflect.defineMetadata(metadataKey, 'wowow', testTraceableMethod)

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    // Invoke the function
    descriptor.value('its an arg!')

    expect(Reflect.getMetadata(metadataKey, descriptor.value)).toStrictEqual('wowow')
  })
})
