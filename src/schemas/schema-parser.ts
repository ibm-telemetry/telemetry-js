/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFileSync } from 'fs'
import yaml from 'js-yaml'

/**
 * Parses a yaml config file and returns it's object representation.
 *
 * @param filePath - Path to the config file.
 * @returns Object containing parsed content.
 * @throws An exception if there is an error parsing the file.
 */
export const parseConfigFile = (filePath: string) => {
  try {
    const contents = readFileSync(filePath, 'utf8')
    return yaml.load(contents)
  } catch (e) {
    throw new Error('Error parsing file. Make sure the file path exists and has the correct format')
  }
}
