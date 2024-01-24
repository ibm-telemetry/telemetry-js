// @ts-nocheck
import {Package3Comp} from 'instrumented'
import {Package3Comp2} from 'instrumented-top-level'

const sample = <Package3Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package3Comp>
const secondSample = <Package3Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package3Comp>
const thirdSample = <Package3Comp2 firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package3Comp2>
const fourthSample = <Package3Comp2 firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package3Comp2>

export {
  sample,
  secondSample,
  thirdSample,
  fourthSample
}
