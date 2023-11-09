/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Exception thrown when  JsxElement's attribute has an undefined expression value.
 */
export class NoAttributeExpressionFoundError extends Error {
  constructor(attr: string) {
    super('No expression found in attribute ' + attr)
  }
}
