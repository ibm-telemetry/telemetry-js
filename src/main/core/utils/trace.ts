/*
 * Copyright IBM Corp. 2021, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import 'reflect-metadata'

import { type Logger } from '../logger.js'
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
  return function methodDecorator(target, _propertyKey, descriptor) {
    if (descriptor.value !== null && descriptor.value !== undefined) {
      return
    }

    const traceableTarget = target as typeof target & { logger?: Logger, name?: string }

    if (traceableTarget.logger == null) {
      throw new Error('Attempt to trace method without a defined logger instance')
    }

    const original = descriptor.value as (...args: unknown[]) => unknown


    descriptor.value = withTrace(traceableTarget.logger, original) as typeof descriptor.value

    // Preserve the original method name
    Object.defineProperty(descriptor.value, 'name', { value: original.name })

    // Preserve the original metadata
    Reflect.getMetadataKeys(original).forEach((key) => {
      Reflect.defineMetadata(key, Reflect.getMetadata(key, original), descriptor.value!)
    })
  }
}

/**
 * Returns a wrapped version of a function that uses the provided logger to log a set of debug
 * messages before and after the wrapped functions's execution. The debug messages contain the name
 * of the called function, a stringified version of its arguments, and a stringified version of its
 * return value.
 *
 * @param logger - Instance of Logger extracted from the target.
 * @param functionDef - Original function to trace.
 * @returns A wrapped function.
 */
function withTrace<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- need to accept any function args
  T extends (...args: any[]) => unknown
>(logger: Logger, functionDef: T): T {
  const functionName = functionDef.name || '(anonymous function)'

  return async function traced(this: unknown, ...args: unknown[]) {
    await traceEnter(logger, functionName, args)

    let result

    try {
      // Call the original method and capture the result
      result = functionDef.apply(this, args)

      return result
    } catch (err) {
      result = err
      throw err
    } finally {
      await traceExit(logger, functionName, result)
    }
  } as T
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

export { Trace }
