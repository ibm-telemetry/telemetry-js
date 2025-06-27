/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-nocheck
const something = () => (
  <>
    {/* JsxElements */}
    <Prefix.Element1>SomethingHere</Prefix.Element1>
    <Element1>SomethingHere</Element1>
    <Prefix.Property.Nested.Element>SomethingHere</Prefix.Property.Nested.Element>
    <Element1
      attr1="string"
      attr2={4}
      attr5={undefined}
      attr6={null}
      attr8
      attr9={true}
      attr10={false}
      attr11={variable}
      attr12={element[access]}
      attr13={{key: 'value', key2: 10}}
      {...spreadObj}
      exp={}
    >
      SomethingHere
    </Element1>

    {/* JsxSelfClosingElements */}
    <Prefix.Element1/>
    <Element1/>
    <Prefix.Property.Nested.Element/>
    <Element1
      attr1="string"
      attr2={4}
      attr5={undefined}
      attr6={null}
      attr8
      attr9={true}
      attr10={false}
      attr11={variable}
      attr12={element[access]}
      attr13={{key: 'value', key2: 10}}
      {...spreadObj}
      exp={}
    />
  </>
)
