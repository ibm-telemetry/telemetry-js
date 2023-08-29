/*
 * Copyright IBM Corp. 2021, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import 'reflect-metadata'

import { type Loggable } from './loggable.js'
import { Logger } from './logger.js'
import { safeStringify } from './safe-stringify.js'
import { truncateString } from './truncate-string.js'

const MAX_ARGS_STRING_LENGTH = 500 // characters

/**
 * Returns a decorated version of a method that automatically uses the logging
 * infrastructure to log a set of debug messages before and after the decorated method's execution.
 * The debug messages contain the name of the called method, a stringified version of its arguments,
 * and a stringified version of its return value.
 *
 * **Note:** This decorator **redefines** the provided method in order to wrap it with logging
 * logic. It reconstitutes the metadata from the source method onto the new one, but certain
 * reference equality checks may fail if they are looking at method property descriptor values
 * directly.
 *
 * @returns A decorated method.
 */
function Trace(): MethodDecorator {
  return function methodDecorator(_target, propertyKey, descriptor) {
    if (
      descriptor.value === null ||
      descriptor.value === undefined ||
      !(descriptor.value instanceof Function)
    ) {
      return
    }

    // Adjust type to represent a descriptor that is guaranteed to have a value
    const descriptorWithValue = descriptor as typeof descriptor & {
      value: NonNullable<(typeof descriptor)['value']>
    }

    const original = descriptor.value

    descriptor.value = function (this: Loggable, ...args: unknown[]) {
      // We treat this as unknown because we can't enforce this decorator is defined on a Loggable
      const logger: unknown = this.logger

      if (!(logger instanceof Logger)) {
        throw new Error('Attempt to trace method without a defined logger instance')
      }

      setImmediate(() => {
        void traceEnter(logger, String(propertyKey), args)
      })

      let result: unknown
      try {
        result = original.apply(this, args)
      } catch (err) {
        setImmediate(() => {
          void traceExit(logger, String(propertyKey), err)
        })

        throw err
      }

      setImmediate(() => {
        void traceExit(logger, String(propertyKey), result)
      })

      return result
    } as typeof descriptor.value

    // Preserve the original method name
    Object.defineProperty(descriptor.value, 'name', { value: original.name })

    // Preserve the original metadata
    Reflect.getMetadataKeys(original).forEach((key) => {
      Reflect.defineMetadata(key, Reflect.getMetadata(key, original), descriptorWithValue.value)
    })
  }
}

async function traceEnter(logger: Logger, methodName: string, args: unknown[]) {
  const stringArgs = truncateString(String(args.map(safeStringify)), MAX_ARGS_STRING_LENGTH)

  await logger.log('debug', `-> ${methodName}(${stringArgs})`)
}

async function traceExit(logger: Logger, methodName: string, result: unknown) {
  if (result instanceof Promise) {
    result.then(
      async (value: unknown) => {
        await logger.log(
          'debug',
          `<- ${methodName} <- ${truncateString(safeStringify(value), MAX_ARGS_STRING_LENGTH)}`
        )
      },
      async (err: unknown) => {
        await logger.log('debug', `-x- ${methodName} <- ${err?.toString() ?? ''}`)
      }
    )
  } else {
    await logger.log(
      'debug',
      `${result instanceof Error ? '-x-' : '<-'} ${methodName} <- ${
        result instanceof Error
          ? result.toString()
          : truncateString(safeStringify(result), MAX_ARGS_STRING_LENGTH)
      }`
    )
  }
}

export { MAX_ARGS_STRING_LENGTH, Trace }
