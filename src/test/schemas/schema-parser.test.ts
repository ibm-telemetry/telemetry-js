/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it, vi } from 'vitest'

import { parseConfigFile } from '../../schemas/schema-parser.js'

vi.mock('fs', async () => {
  return {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- d
    ...(await vi.importActual<typeof import('node:fs')>('node:fs')),
    readFileSync: vi.fn().mockImplementation((filePath) => {
      switch (filePath) {
        case 'happyPath':
          return '# yaml-language-server: $schema=./telemetrics-config.schema.json\n' +
                        'version: 1\n' +
                        'collect:\n' +
                        '   npm:\n' +
                        '        dependencies:\n' +
                        '   jsx:\n' +
                        '        elements:\n' +
                        '           allowedAttributeStringValues:\n' +
                        "               - 'one'\n" +
                        "               - 'two'\n" +
                        "projectId: '1234'"
        case 'malformed':
        default:
          return 'hey: "hey" "hey2"'
      }
    })
  }
})

describe('parseConfigFile', () => {
  it('successfully parses correctly formatted file', () => {
    expect(parseConfigFile('happyPath')).toStrictEqual({
      collect: {
        jsx: {
          elements: {
            allowedAttributeStringValues: [
              'one',
              'two'
            ]
          }
        },
        npm: {
          dependencies: null
        }
      },
      projectId: '1234',
      version: 1
    })
  })

  it('throws error for malformed files', () => {
    expect(() => parseConfigFile('malformed')).toThrow(Error)
  })
})
