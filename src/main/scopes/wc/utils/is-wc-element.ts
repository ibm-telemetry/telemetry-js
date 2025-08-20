/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { WcElement } from '../interfaces.js'

/* eslint-disable @typescript-eslint/no-explicit-any -- allow subtype flexibility */
/**
 * Function to determine if an element is of type WcElement.
 *
 * @param element - Element to check.
 * @returns Boolean determining if element is a web component.
 */
export function isWcElement(element: any): element is WcElement {
  return (
    typeof element.name === 'string' && Array.isArray(element.attributes) && !('prefix' in element)
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any -- re-enabling rule after specific use */
