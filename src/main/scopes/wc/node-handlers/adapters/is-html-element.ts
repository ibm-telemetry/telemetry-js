import { Element, Node } from 'domhandler'

export function isHtmlElement(node: Node): node is Element {
  return node.type === 'tag' || node.type === 'script' || node.type === 'style'
}
