/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-nocheck
import { ImaginaryThing, Function1, A_TOKEN as A_RENAMED_TOKEN } from 'instrumented'
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

anObject['property'][A_RENAMED_TOKEN]('hey', 500, {yeah: 'yeah'})

Function1()