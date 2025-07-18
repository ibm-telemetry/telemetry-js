import { JsxElement } from '../../jsx/interfaces.js'

export function isJsxElement(element: any): element is JsxElement {
  return 'prefix' in element && 'attributes' in element
}
