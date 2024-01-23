// @ts-nocheck
import {Package1Comp} from 'instrumented'
import {Package1Comp2} from 'instrumented-top-level'

const sample = <Package1Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package1Comp>
const secondSample = <Package1Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package1Comp>
const thirdSample = <Package1Comp2 firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package1Comp2>
const fourthSample = <Package1Comp2 firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package1Comp2>

export {
  sample,
  secondSample,
  thirdSample,
  fourthSample
}
