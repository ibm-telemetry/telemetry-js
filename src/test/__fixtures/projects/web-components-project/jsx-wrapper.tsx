/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-nocheck
import { ImaginaryThing, Function1, A_TOKEN as A_RENAMED_TOKEN, anObject } from 'instrumented'
import OtherThing from '@not/instrumented'

export const MyComponent = ({ other, ...spreadObj }) => {
  return (
    <OtherThing firstProp="hi">
      <ImaginaryThing firstProp="hi" secondProp="wow" notAllowed="notAllowed" />
    </OtherThing>
  )
}
