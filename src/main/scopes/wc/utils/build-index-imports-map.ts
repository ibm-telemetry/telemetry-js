import { readdir, readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { Logger } from '../../../core/log/logger.js'
import { Dirent } from 'node:fs'
import { join } from 'node:path'

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
  componentsDir: string,
  logger: Logger
): Promise<Map<string, string[]>> {
  const result: Map<string, string[]> = new Map()

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

export function buildComponentIndexAbsolutePath(
  componentsDir: string,
  componentName: string
): string {
  return path.join(componentsDir, componentName, 'index.js')
}

/**
 * Resolves the absolute path to the 'components' directory inside a given installed package.
 *
 * @param baseDir - The root directory where the package is installed (e.g., your app or fixture root)
 * @param packageName - The name of the installed package (e.g., '@carbon/web-components')
 * @returns A promise to the absolute path to the 'components' directory within the package
 */
export async function resolveComponentsDir(
  baseDir: string,
  packageName: string
): Promise<string | undefined> {
  const pkgDir = join(baseDir, 'node_modules', packageName)

  async function findComponentsDir(dir: string): Promise<string | undefined> {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        if (entry.name === 'components') {
          return fullPath
        }

        const found = await findComponentsDir(fullPath)
        if (found) return found
      }
    }

    return undefined
  }

  return findComponentsDir(pkgDir)
}
