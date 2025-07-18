import ts from 'typescript'
import { ParsedFile } from '../../interfaces.js'

export function isTsSourceFile(node: ParsedFile): node is ts.SourceFile {
  return (
    typeof (node as ts.SourceFile).kind === 'number' &&
    Array.isArray((node as ts.SourceFile).statements)
  )
}
