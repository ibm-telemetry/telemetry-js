import { readdir, readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { Logger } from '../../../core/log/logger.js'

/**
 * Scans all components in a package's `es` directory and extracts side-effect import paths from each component's `index.js`.
 *
 * Side-effect imports are import statements without bindings, e.g.:
 * ```ts
 * import './some-file.js';
 * ```
 *
 * @param baseDir - The root directory where the package is installed (e.g., 'node_modules')
 * @param packageName - The package folder name (e.g., '@carbon/web-components')
 * @returns A Promise resolving to an object mapping each component name to an array of side-effect import paths found in its `index.js`.
 *
 * @throws Throws if reading an `index.js` fails due to unexpected errors other than missing files.
 */
export async function buildIndexImportsMap(
  baseDir: string,
  packageName: string,
  logger: Logger
): Promise<Map<string, string[]>> {
  const componentsDir = path.join(baseDir, 'node_modules', packageName, 'es', 'components')
  const result: Map<string, string[]> = new Map()

  const entries = await readdir(componentsDir, { withFileTypes: true })
  logger.debug('The entries are', JSON.stringify(entries))

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const componentName = entry.name

    const indexPath = buildAbsolutePath(baseDir, packageName, componentName)

    try {
      const content = await readFile(indexPath, 'utf-8')

      const importRegex = /^import\s+['"]([^'"]+)['"];/gm
      const imports: string[] = []
      let match: RegExpExecArray | null

      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1] ?? '')
      }

      if (imports.length > 0) {
        // Deduplicate and sort imports
        result.set(indexPath, Array.from(new Set(imports)).sort())
      }
    } catch (error: any) {
      logger.debug('THIS IS THE ERROR', JSON.stringify(entry))
      logger.error(error)

      //   throw new Error(error)
    }
  }

  logger.debug('IT IS OVER')
  return result
}

export function buildAbsolutePath(
  baseDir: string,
  packageName: string,
  componentName: string
): string {
  const componentsDir = path.join(baseDir, 'node_modules', packageName, 'es', 'components')
  return path.join(componentsDir, componentName, 'index.js')
}

export function buildPackagePath(packageName: string, componentName: string): string {
  const componentsDir = path.join(packageName, 'es', 'components')
  return path.join(componentsDir, componentName, 'index.js')
}
