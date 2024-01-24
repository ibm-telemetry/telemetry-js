/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-nocheck
import { ImaginaryThing } from 'instrumented'
import OtherThing from '@not/instrumented'

export const MyComponent = ({other, ...spreadObj}) => {
  return (
    <OtherThing firstProp="hi">
        <ImaginaryThing
          firstProp="hi"
          secondProp="wow"
          numberProp={5}
          undefinedProp={undefined}
          nullProp={null}
          objectProp={{key: 'value'}}
          isCool
          isExplicitlyCool={true}
          isNotCool={false}
          objAccess={obj['accessKey']}
          {...spreadObj}
        />
    </OtherThing>
  )
}
