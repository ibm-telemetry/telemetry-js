/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'node:fs/promises'
import * as path from 'node:path'

import { parseYamlFile } from '../../main/core/parse-yaml-file.js'

/**
 * Assists in the loading of test fixtures.
 */
export class Fixture {
  public readonly path: string

  /**
   * Constructs a new test fixture based on a path to a fixture file.
   *
   * @param fixturePath - Absolute path to the fixture within the __fixtures directory.
   */
  public constructor(fixturePath: string) {
    this.path = path.resolve('src/test/__fixtures', fixturePath)
  }

  /**
   * Treats the fixture as JSON and returns a parsed representation of it.
   *
   * @returns The fixture as parsed JSON.
   */
  public async parse() {
    const extension = path.extname(this.path)
    switch (extension) {
      case '.json':
        return JSON.parse(await this.toString())
      case '.yml':
      case '.yaml':
        return await parseYamlFile(this.path)
    }
  }

  /**
   * Returns the text from the fixture file.
   *
   * @returns The text.
   */
  public async toString() {
    return (await readFile(this.path)).toString()
  }
}
