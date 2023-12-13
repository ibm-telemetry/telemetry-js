// @ts-nocheck
import {Package2Comp} from 'instrumented'
import {Package2Comp2} from 'instrumented-top-level'
import {Package2AnotherPackageComp} from 'another-package'

const sample = <Package2Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package2Comp>
const secondSample = <Package2Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package2Comp>
const thirdSample = <Package2Comp2 firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package2Comp2>
const fourthSample = <Package2Comp2 firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package2Comp2>
const anotherPackageSample = <Package2AnotherPackageComp bla bleh="bluh" />

export {
  sample,
  secondSample,
  thirdSample,
  fourthSample,
  anotherPackageSample
}