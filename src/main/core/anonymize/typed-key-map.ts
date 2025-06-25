/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { safeStringify } from '../log/safe-stringify.js'

/**
 * Extension of a Map that uses a custom key generator. The generator uses the MapKey class to wrap
 * incoming keys, including their type and value in the MapKey object. A stringified representation
 * of the MapKey is used as the key of the entry in the TypedKeyMap object.
 */
export class TypedKeyMap extends Map {
  override has(key: unknown): boolean {
    const mapKey = new MapKey(typeof key, key)

    return super.has(safeStringify(mapKey))
  }

  override get(key: unknown) {
    const mapKey = new MapKey(typeof key, key)

    return super.get(safeStringify(mapKey))
  }

  override set(key: unknown, value: unknown): this {
    const mapKey = new MapKey(typeof key, key)

    return super.set(safeStringify(mapKey), value)
  }
}

/**
 * Keys of the TypedKeyMap class.
 */
class MapKey {
  constructor(
    public readonly type: string,
    public readonly val: unknown
  ) {}
}
