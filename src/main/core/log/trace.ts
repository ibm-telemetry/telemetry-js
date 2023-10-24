/*
 * Copyright IBM Corp. 2021, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import 'reflect-metadata'

import { LoggerNotFoundError } from '../../exceptions/logger-not-found-error.js'
import { type Loggable } from './loggable.js'
import { Logger } from './logger.js'

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
export function Trace(): MethodDecorator {
  return function methodDecorator(target, propertyKey, descriptor) {
    if (
      descriptor.value === null ||
      descriptor.value === undefined ||
      !(descriptor.value instanceof Function)
    ) {
      return
    }

    const targetName = target.constructor.name

    // Adjust type to represent a descriptor that is guaranteed to have a value
    const descriptorWithValue = descriptor as typeof descriptor & {
      value: NonNullable<(typeof descriptor)['value']>
    }

    const original = descriptor.value

    descriptor.value = function (this: Loggable, ...args: unknown[]) {
      // We treat this as unknown because we can't enforce this decorator is defined on a Loggable
      const logger: unknown = this.logger

      if (!(logger instanceof Logger)) {
        throw new LoggerNotFoundError()
      }

      logger.traceEnter(targetName, String(propertyKey), args)

      let result: unknown
      try {
        result = original.apply(this, args)
      } catch (e) {
        logger.traceExit(targetName, String(propertyKey), e)

        throw e
      }

      logger.traceExit(targetName, String(propertyKey), result)

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
