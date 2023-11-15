/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-nocheck
import { ImaginaryThing } from 'instrumented'
import OtherThing from '@not/instrumented'
import someIdentifier from 'someplace-else'

export const MyComponent = ({other, ...spreadObj}) => {
  return (
    <OtherThing firstProp="firstPropValue">
        <ImaginaryThing
          stringProp="stringPropValue"
          secondStringProp="secondStringPropValue"
          numberProp={5}
          undefinedProp={undefined}
          nullProp={null}
          objectLiteralProp={{key: 'value'}}
          isBooleanProp
          isTrueLiteralProp={true}
          isFalseLiteralProp={false}
          objectAccessProp={obj['accessKey']}
          identifierProp={someIdentifier}
          expressionProp={1 === 5 ? 'expression lhs' : 'expression rhs'}
          {...spreadObj}
        />
    </OtherThing>
  )
}
