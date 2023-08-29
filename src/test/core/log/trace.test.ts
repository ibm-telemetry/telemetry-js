/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { safeStringify } from '../../../main/core/log/safe-stringify.js'
import { MAX_ARGS_STRING_LENGTH, Trace } from '../../../main/core/log/trace.js'

const testLogger = {
  log: (_level: 'debug', _msg: string | Error) => {}
}

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

    // Invoke the function
    let result: unknown
    try {
      descriptor.value('its an arg!')
    } catch (err) {
      result = err
    }

    expect(result instanceof Error).toBeTruthy()
    expect((result as Error).message).toStrictEqual(
      'Attempt to trace method without a defined logger instance'
    )
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
    } catch (err) {
      result = err
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
    } catch (err) {
      result = err
    }

    expect(result instanceof Error).toBeTruthy()
  })
  it('works with an undefined return value', () => {
    const testTraceableMethod = () => undefined

    const descriptor = { value: testTraceableMethod, logger: testLogger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- TODOASKJOE
    const result = descriptor.value()

    expect(result).toStrictEqual(undefined)
  })

  it('works with a symbol', () => {
    const testTraceableMethod = () => Symbol('asdf')

    const logger = new (class MyLogger {
      // TODOASKJOE
      log(_level: 'debug', msg: string) {
        if (msg.startsWith('<-')) {
          expect(msg.endsWith('<- testFunctionName <- Symbol(asdf)')).toBeTruthy()
        } else {
          expect(msg.startsWith('->')).toBeTruthy()
        }
      }
    })()

    const descriptor = { value: testTraceableMethod, logger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    // Invoke the function
    descriptor.value()
  })

  it('works with a bigint', () => {
    const testTraceableMethod = () => BigInt(123)

    const logger = new (class MyLogger {
      // TODOASKJOE
      log(_level: 'debug', msg: string) {
        if (msg.startsWith('<-')) {
          expect(msg.endsWith('<- testFunctionName <- 123')).toBeTruthy()
        } else {
          expect(msg.startsWith('->')).toBeTruthy()
        }
      }
    })()

    const descriptor = { value: testTraceableMethod, logger }

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

  it('truncates a long arg list', () => {
    const argsList: string[] = []
    for (let i = 0; i < 500; i++) {
      argsList.push('a')
    }

    const expected =
      '-> testFunctionName(' +
      String(argsList.map(safeStringify)).substring(0, MAX_ARGS_STRING_LENGTH) +
      '... (truncated))'

    const logger = new (class MyLogger {
      // TODOASKJOE
      log(_level: 'debug', msg: string) {
        if (msg.startsWith('->')) {
          expect(msg).toStrictEqual(expected)
        } else {
          expect(msg.startsWith('<-')).toBeTruthy()
        }
      }
    })()

    const testTraceableMethod = (...arg: string[]) => arg

    const descriptor = { value: testTraceableMethod, logger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    descriptor.value(...argsList)
  })

  it('truncates a long return value', () => {
    const retVal = ''.padEnd(MAX_ARGS_STRING_LENGTH * 2, 'a')

    const expected =
      '<- testFunctionName <- ' +
      JSON.stringify(retVal).substring(0, MAX_ARGS_STRING_LENGTH) +
      '... (truncated)'

    const logger = new (class MyLogger {
      // TODOASKJOE
      log(_level: 'debug', msg: string) {
        if (msg.startsWith('<-')) {
          expect(msg.startsWith(expected)).toBeTruthy()
        } else {
          expect(msg.startsWith('->')).toBeTruthy()
        }
      }
    })()

    const testTraceableMethod = () => retVal

    const descriptor = { value: testTraceableMethod, logger }

    // Decorate the function
    Trace()({}, 'testFunctionName', descriptor)

    descriptor.value()
  })
})
