/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { YAMLException } from 'js-yaml'
import { describe, expect, it } from 'vitest'

import { parseYamlFile } from '../../main/core/parse-yaml-file.js'
import { Fixture } from '../__utils/fixture.js'

describe('parseYamlFile', () => {
  it('successfully parses correctly formatted file', async () => {
    const fixture = new Fixture('config-files/valid/all-keys.yml')

    await expect(parseYamlFile(fixture.path)).resolves.resolves.not.toThrow()
  })

  it('throws error for malformed files', async () => {
    const fixture = new Fixture('config-files/invalid/malformed.yml')

    await expect(parseYamlFile(fixture.path)).rejects.toThrow(YAMLException)
  })
})
