/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'node:fs/promises'

import yaml from 'js-yaml'

import { YamlParseError } from '../exceptions/yaml-parse-error.js'

/**
 * Parses a yaml file and returns its object representation.
 *
 * @param filePath - Path to the yaml file.
 * @returns Object containing parsed content.
 * @throws An exception if there is an error parsing the file.
 */
export async function parseYamlFile(filePath: string) {
  try {
    const contents = await readFile(filePath, 'utf8')
    return yaml.load(contents)
  } catch (e) {
    // TODO: add error data to this exception
    throw new YamlParseError(
      'Error parsing file. Make sure the file path exists and has the correct format'
    )
  }
}
