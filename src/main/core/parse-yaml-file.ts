/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'node:fs/promises'

import yaml from 'js-yaml'

/**
 * Parses a yaml file and returns its object representation.
 *
 * @param filePath - Path to the yaml file.
 * @returns Object containing parsed content.
 * @throws A YAMLException exception if there is an error parsing the file, or an ENOENT Error if
 * the config file could not be found.
 */
export async function parseYamlFile(filePath: string) {
  const contents = await readFile(filePath, 'utf8')
  return yaml.load(contents)
}
