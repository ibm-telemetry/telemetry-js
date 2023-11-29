// @ts-nocheck
import Button from 'instrumented'

const sample = <Button firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>Hey</Button>
const secondSample = <Button firstProp={1 === 5 ? 'boo' : 'baa'} simple="4" hi={} woo>key again</Button>

export {
  sample,
  secondSample
}
