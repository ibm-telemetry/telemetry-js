/*
 * Copyright IBM Corp. 2026, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ComplexValue } from '../complex-value.js'

/**
 * The value type shared by both JSX and WC element attributes.
 */
export type AttributeValue = string | number | boolean | ComplexValue | null | undefined

/**
 * For each entry in `attrMap` whose name is in `allowedAttributeNames` and whose value is a
 * `ComplexValue` wrapping a plain object, replaces the single entry with one entry per sub-key
 * (keyed as `attrName.subKey`). Sub-keys whose name is in `allowedAttributeObjectKeys` are
 * returned in `addedKeys` so the caller can treat them as safe during substitution.
 * Sub-keys not in `allowedAttributeObjectKeys` are still emitted under their dotted key so they
 * are individually anonymized rather than the whole object being anonymized as one value.
 *
 * Attributes whose value is not an object `ComplexValue`, or whose name is not in
 * `allowedAttributeNames`, are passed through unchanged.
 *
 * @param attrMap - Flat map of attribute names to their raw values.
 * @param allowedAttributeNames - Attribute names that are permitted to be expanded.
 * @param allowedAttributeObjectKeys - Sub-key names whose dotted form should survive anonymization.
 * @returns `expanded` — new map with object attributes expanded to dotted sub-key entries, and
 * `addedKeys` — the dotted key names that are safe and should be added to `allowedAttributeNames`
 * before calling `substituteObject`.
 */
export function expandObjectAttributes(
  attrMap: Record<string, AttributeValue>,
  allowedAttributeNames: string[],
  allowedAttributeObjectKeys: string[]
): { expanded: Record<string, AttributeValue>; addedKeys: string[] } {
  const expanded: Record<string, AttributeValue> = {}
  const addedKeys: string[] = []

  for (const [attrName, attrValue] of Object.entries(attrMap)) {
    if (
      allowedAttributeNames.includes(attrName) &&
      attrValue instanceof ComplexValue &&
      typeof attrValue.complexValue === 'object' &&
      attrValue.complexValue !== null &&
      !Array.isArray(attrValue.complexValue)
    ) {
      const subObj = attrValue.complexValue as Record<string, AttributeValue>
      for (const subKey of Object.keys(subObj)) {
        const dottedKey = `${attrName}.${subKey}`
        expanded[dottedKey] = subObj[subKey]
        if (allowedAttributeObjectKeys.includes(subKey)) {
          addedKeys.push(dottedKey)
        }
      }
    } else {
      expanded[attrName] = attrValue
    }
  }

  return { expanded, addedKeys }
}
