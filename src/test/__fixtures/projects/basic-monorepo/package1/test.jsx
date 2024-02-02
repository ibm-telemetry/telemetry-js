// @ts-nocheck
import {Package1Comp} from 'instrumented'

const sample = <Package1Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package1Comp>
const secondSample = <Package1Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package1Comp>

export {
  sample,
  secondSample
}
