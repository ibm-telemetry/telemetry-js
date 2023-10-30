/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Exception thrown when an interface is implemented incorrectly.
 */
export class IncorrectlyImplementedInterfaceError extends Error {
  constructor(property: string, interfaceName: string) {
    super(`Incorrectly implemented property ${property} of interface ${interfaceName}`)
  }
}
