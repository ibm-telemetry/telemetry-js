/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TypedKeyMap } from './typed-key-map.js'

const subs = new TypedKeyMap()
let curSub = 1

function nextSub() {
  return `[redacted${curSub++}]`
}

/**
 * Encapsulates logic that tracks substitution values across a telemetry run.
 */
export class Substitution {
  /**
   * Puts a given value into the substitution map and returns its substituted/anonymized equivalent.
   *
   * @param key - The value to substitute.
   * @returns An anonymized representation of the key (using substitution).
   */
  public put(key: unknown): string {
    if (subs.has(key)) {
      return subs.get(key)
    }

    const next = nextSub()
    subs.set(key, next)

    return next
  }
}
