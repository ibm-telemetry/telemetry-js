/*
 * Copyright IBM Corp. 2021, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import 'reflect-metadata'

import { type Loggable } from './loggable.js'
import { type Logger } from './logger.js'
import { safeStringify } from './safe-stringify.js'

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
      const logger = this.logger
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODOASKJOE
      if (logger === undefined) {
        throw new Error('Attempt to trace method without a defined logger instance')
      }

      setImmediate(() => {
        void traceEnter(logger, String(propertyKey), args)
      })

      const result = original.apply(this, args)

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

function truncate(str: string) {
  if (str.length > MAX_ARGS_STRING_LENGTH) {
    return str.substring(0, MAX_ARGS_STRING_LENGTH) + '... (truncated)'
  }

  return str
}

async function traceEnter(logger: Logger, methodName: string, args: unknown[]) {
  const stringArgs = truncate(String(args.map(safeStringify)))

  await logger.log('debug', `-> ${methodName}(${stringArgs})`)
}

async function traceExit(logger: Logger, methodName: string, result: unknown) {
  if (result instanceof Promise) {
    result.then(
      async (value: unknown) => {
        await logger.log('debug', `<- ${methodName} <- ${truncate(safeStringify(value))}`)
      },
      async (err: unknown) => {
        await logger.log('debug', `-x- ${methodName} <- ${err?.toString() ?? ''}`)
      }
    )
  } else {
    await logger.log(
      'debug',
      `${result instanceof Error ? '-x-' : '<-'} ${methodName} <- ${
        result instanceof Error ? result.toString() : truncate(safeStringify(result))
      }`
    )
  }
}

export { MAX_ARGS_STRING_LENGTH, Trace }
