import { readdir, readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { Logger } from '../../../core/log/logger.js'
import { Dirent } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

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
  packageName: string,
  logger: Logger
): Promise<Map<string, string[]>> {
  let componentsDir: string
  const result: Map<string, string[]> = new Map()

  try {
    componentsDir = await resolveComponentDir(packageName)
  } catch (err) {
    logger.error(`Failed to resolve component directory for ${packageName}`)
    return result
  }

  let entries: Dirent[] = []

  try {
    entries = await readdir(componentsDir, { withFileTypes: true })
  } catch (err: any) {
    logger.error(`Failed to read directory ${componentsDir}:`)
    return result
  }

  logger.debug('The entries are', JSON.stringify(entries))

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const componentDir = join(componentsDir, entry.name)
    const indexPath = join(componentDir, 'index.js')

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
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err)
      } else {
        logger.error(String(err))
      }
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

export async function resolveComponentDir(packageName: string): Promise<string> {
  const entryPath = fileURLToPath(await import.meta.resolve(packageName))
  const packageRoot = dirname(entryPath)

  // Walk up until we hit the actual package root (not the entry)
  const possibleComponentsDir = join(packageRoot, 'components')
  return possibleComponentsDir
}
