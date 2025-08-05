/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Dirent } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { join } from 'node:path'

import type { Logger } from '../../../core/log/logger.js'

/**
 * Scans all components in a package's `es` directory and extracts side-effect import paths
 * from each component's `index.js`.
 *
 * Side-effect imports are import statements without bindings, e.g.:.
 * ```ts
 * import './some-file.js';
 * ```
 *
 * @param componentsDir - The directory where all the component directories are.
 * @param logger - The logger instance.
 * @returns A Promise resolving to an object mapping each component name to an array of side-effect
 *  import paths found in its `index.js`.
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
  } catch (err) {
    logger.error(`Failed to read directory ${componentsDir}:`)
    logger.error(err as Error)
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

/**
 * Builds the path to the current component's index file, if it exists.
 *
 * @param componentsDir - The components directory to base the path in.
 * @param componentName - The component name.
 * @returns Absolute path of the current component directory.
 */
export function buildComponentIndexAbsolutePath(
  componentsDir: string,
  componentName: string
): string {
  return path.join(componentsDir, componentName, 'index.js')
}

/**
 * Resolves the absolute path to the 'components' directory inside a given installed package.
 *
 * @param baseDir - The root directory where the package is installed.
 * @param packageName - The name of the installed package (e.g. '@carbon/web-components').
 * @returns A promise to the absolute path to the 'components' directory within the package.
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
        if (found !== undefined) return found
      }
    }

    return undefined
  }

  return findComponentsDir(pkgDir)
}
