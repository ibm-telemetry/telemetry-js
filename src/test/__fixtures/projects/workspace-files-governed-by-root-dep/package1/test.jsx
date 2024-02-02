// @ts-nocheck
import { PackageComp } from 'instrumented-top-level'

const sample = <PackageComp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</PackageComp>
const secondSample = <PackageComp firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</PackageComp>

export {
  sample,
  secondSample
}
