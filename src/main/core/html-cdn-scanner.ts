/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'node:fs/promises'

import type { Document as HtmlDocument } from 'domhandler'
import { parseDocument } from 'htmlparser2'

import { isCdnLink } from '../scopes/wc/utils/is-cdn-link.js'
import { isHtmlElement } from '../scopes/wc/utils/is-html-element.js'
import { parseCdnImport } from '../scopes/wc/utils/parse-cdn-import.js'
import type { CdnImport, HtmlParsedFile } from '../scopes/wc/interfaces.js'
import type { Logger } from './log/logger.js'
import { Trace } from './log/trace.js'

/**
 * Scans HTML files for CDN imports without full AST processing.
 * This is used during the pre-scan phase to detect CDN usage.
 */
export class HtmlCdnScanner {
  private readonly logger: Logger

  /**
   * Constructs a new HTML CDN scanner.
   *
   * @param logger - Logger instance.
   */
  public constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * Scans an HTML file for CDN script imports.
   *
   * @param filePath - Absolute path to the HTML file.
   * @returns Array of CDN imports found in the file.
   */
  @Trace()
  public async scanFile(filePath: string): Promise<CdnImport[]> {
    try {
      const content = await readFile(filePath, 'utf-8')
      const document = parseDocument(content) as HtmlParsedFile
      document.fileName = filePath

      return this.extractCdnImports(document)
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error)
      } else {
        this.logger.error(`Failed to scan HTML file ${filePath}: ${String(error)}`)
      }
      return []
    }
  }

  /**
   * Extracts CDN imports from a parsed HTML document.
   *
   * @param document - Parsed HTML document.
   * @returns Array of CDN imports.
   */
  @Trace()
  private extractCdnImports(document: HtmlDocument): CdnImport[] {
    const cdnImports: CdnImport[] = []
    const scriptSources = this.findScriptSources(document)

    for (const scriptSource of scriptSources) {
      if (isCdnLink(scriptSource)) {
        try {
          const cdnImport = parseCdnImport(scriptSource)
          if (cdnImport.package && cdnImport.version) {
            cdnImports.push(cdnImport)
            this.logger.debug(`Found CDN import: ${cdnImport.package}@${cdnImport.version}`)
          }
        } catch (error) {
          if (error instanceof Error) {
            this.logger.error(error)
          } else {
            this.logger.error(`Failed to parse CDN import from ${scriptSource}: ${String(error)}`)
          }
        }
      }
    }

    return cdnImports
  }

  /**
   * Recursively finds all script src attributes in the HTML document.
   *
   * @param node - Current node to search.
   * @returns Array of script source URLs.
   */
  private findScriptSources(node: HtmlDocument | any): string[] {
    const sources: string[] = []

    if (isHtmlElement(node) && node.name === 'script') {
      const src = node.attribs?.['src']
      if (src) {
        sources.push(src)
      }
    }

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        sources.push(...this.findScriptSources(child))
      }
    }

    return sources
  }

  /**
   * Scans multiple HTML files for CDN imports.
   *
   * @param filePaths - Array of absolute paths to HTML files.
   * @returns Map of file paths to their CDN imports.
   */
  @Trace()
  public async scanFiles(filePaths: string[]): Promise<Map<string, CdnImport[]>> {
    const results = new Map<string, CdnImport[]>()

    const promises = filePaths.map(async (filePath) => {
      const cdnImports = await this.scanFile(filePath)
      if (cdnImports.length > 0) {
        results.set(filePath, cdnImports)
      }
    })

    await Promise.all(promises)

    return results
  }
}
