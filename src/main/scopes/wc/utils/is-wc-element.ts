import { WcElement } from '../interfaces.js'

export function isWcElement(element: any): element is WcElement {
  return 'name' in element && 'attributes' in element
}
