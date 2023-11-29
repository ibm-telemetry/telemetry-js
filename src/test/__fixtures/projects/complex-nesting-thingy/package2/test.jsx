// @ts-nocheck
import {Package2Comp} from 'instrumented'

const sample = <Package2Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Package2Comp>
const secondSample = <Package2Comp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Package2Comp>

export {
  sample,
  secondSample
}
