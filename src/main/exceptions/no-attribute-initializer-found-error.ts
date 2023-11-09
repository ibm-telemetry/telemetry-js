/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Exception thrown when JsxElement's attribute has an undefined initializer value.
 */
export class NoAttributeInitializerFoundError extends Error {
  constructor(attr: string) {
    super('No initializer found in attribute ' + attr)
  }
}
