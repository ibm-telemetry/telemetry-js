/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import { ConfigValidator } from '../../../main/core/config/config-validator.js'
import { type ConfigValidationError } from '../../../main/exceptions/config-validation-error.js'
import { Fixture } from '../../__utils/fixture.js'

// TODO: get this from the external package
const schemaFile = 'src/schemas/telemetrics-config.schema.json'
const schemaFileContents = (await readFile(schemaFile)).toString()
const validator = new ConfigValidator(JSON.parse(schemaFileContents))

describe('configValidator', () => {
  it('returns for a valid configuration', async () => {
    const fixture = new Fixture('config-files/valid-config-all-keys.yml')
    const config = await fixture.parse()

    expect(() => {
      validator.validateConfig(config)
    }).not.toThrow()
  })

  it('does not allow extra properties', async () => {
    const fixture = new Fixture('config-files/invalid/extra-key.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validateConfig(config)
    } catch (e) {
      err = e
    }

    // expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '',
        keyword: 'additionalProperties',
        message: 'must NOT have additional properties',
        params: {
          additionalProperty: 'hey'
        }
      }
    ])
  })

  // it('does not allow extra properties', () => {
  //   const testObj = { ...sampleConfig, hey: 'hey' }
  //   expect(getConfigObjectValidationErrors(testObj)).toStrictEqual([
  //     {
  //       instancePath: '',
  //       keyword: 'additionalProperties',
  //       message: 'must NOT have additional properties',
  //       params: {
  //         additionalProperty: 'hey'
  //       }
  //     }
  //   ])
  // })

  // it('requires version', () => {
  //   const { version: _version, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(getConfigObjectValidationErrors(rest as any)).toStrictEqual([
  //     {
  //       instancePath: '',
  //       keyword: 'required',
  //       message: "must have required property 'version'",
  //       params: {
  //         missingProperty: 'version'
  //       }
  //     }
  //   ])
  // })

  // it('requires projectId', () => {
  //   const { projectId: _projectId, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(getConfigObjectValidationErrors(rest as any)).toStrictEqual([
  //     {
  //       instancePath: '',
  //       keyword: 'required',
  //       message: "must have required property 'projectId'",
  //       params: {
  //         missingProperty: 'projectId'
  //       }
  //     }
  //   ])
  // })

  // it('requires collect', () => {
  //   const { collect: _collect, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(getConfigObjectValidationErrors(rest as any)).toStrictEqual([
  //     {
  //       instancePath: '',
  //       keyword: 'required',
  //       message: "must have required property 'collect'",
  //       params: {
  //         missingProperty: 'collect'
  //       }
  //     }
  //   ])
  // })

  // it('requires at least one property in npm scope', () => {
  //   const { collect: _collect, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(getConfigObjectValidationErrors({ ...rest, collect: { npm: {} } })).toStrictEqual([
  //     {
  //       instancePath: '/collect/npm',
  //       keyword: 'minProperties',
  //       message: 'must NOT have fewer than 1 properties',
  //       params: {
  //         limit: 1
  //       }
  //     }
  //   ])
  // })

  // it('requires at least one property in jsx scope', () => {
  //   const { collect: _collect, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(getConfigObjectValidationErrors({ ...rest, collect: { jsx: {} } })).toStrictEqual([
  //     {
  //       instancePath: '/collect/jsx',
  //       keyword: 'minProperties',
  //       message: 'must NOT have fewer than 1 properties',
  //       params: {
  //         limit: 1
  //       }
  //     }
  //   ])
  // })

  // it('allows for an empty elements object in jsx scope', () => {
  //   const { collect: _collect, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(
  //     getConfigObjectValidationErrors({ ...rest, collect: { jsx: { elements: {} } } })
  //   ).toStrictEqual([])
  // })

  // it('requires at least one name if allowedAttributeNames is defined', () => {
  //   const { collect: _collect, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(
  //     getConfigObjectValidationErrors({
  //       ...rest,
  //       collect: { jsx: { elements: { allowedAttributeNames: [] } } }
  //     })
  //   ).toStrictEqual([
  //     {
  //       instancePath: '/collect/jsx/elements/allowedAttributeNames',
  //       keyword: 'minItems',
  //       message: 'must NOT have fewer than 1 items',
  //       params: {
  //         limit: 1
  //       }
  //     }
  //   ])
  // })

  // it('requires at least one value if allowedAttributeStringValues is defined', () => {
  //   const { collect: _collect, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(
  //     getConfigObjectValidationErrors({
  //       ...rest,
  //       collect: { jsx: { elements: { allowedAttributeStringValues: [] } } }
  //     })
  //   ).toStrictEqual([
  //     {
  //       instancePath: '/collect/jsx/elements/allowedAttributeStringValues',
  //       keyword: 'minItems',
  //       message: 'must NOT have fewer than 1 items',
  //       params: {
  //         limit: 1
  //       }
  //     }
  //   ])
  // })

  // it('is able to identify more than one error', () => {
  //   const { version: _version, collect: _collect, ...rest } = sampleConfig
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  //   expect(
  //     getConfigObjectValidationErrors({
  //       ...rest,
  //       collect: { jsx: { elements: { allowedAttributeStringValues: [] } } }
  //     })
  //   ).toStrictEqual([
  //     {
  //       instancePath: '',
  //       keyword: 'required',
  //       message: "must have required property 'version'",
  //       params: {
  //         missingProperty: 'version'
  //       }
  //     },
  //     {
  //       instancePath: '/collect/jsx/elements/allowedAttributeStringValues',
  //       keyword: 'minItems',
  //       message: 'must NOT have fewer than 1 items',
  //       params: {
  //         limit: 1
  //       }
  //     }
  //   ])
  // })
})
