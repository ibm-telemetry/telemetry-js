/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-nocheck

import Button from 'button-library'

const sample = <Button something={1 === 5 ? 'boo' : 'baa'} simple="4">Hey</Button>

const undef = undefined

export default sample
