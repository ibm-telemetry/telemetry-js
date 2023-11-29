// @ts-nocheck
import {Package3Comp} from 'instrumented'

const sample = <Package3Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package3Comp>
const secondSample = <Package3Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package3Comp>

export {
  sample,
  secondSample
}
