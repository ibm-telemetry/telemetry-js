/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Schema as Config } from '../../schemas/Schema.js'
import { type Scope } from '../core/scope.js'
import { NpmScope } from './npm/npm-scope.js'

export const scopeRegistry: Record<keyof Config['collect'], typeof Scope | undefined> = {
  jsx: undefined,
  npm: NpmScope
}
