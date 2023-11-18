/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import configFileSchema from '@ibm/telemetry-config-schema/config.schema.json'
import { describe, expect, it } from 'vitest'

import { ConfigValidator } from '../../main/core/config-validator.js'
import { ConfigValidationError } from '../../main/exceptions/config-validation-error.js'
import { Fixture } from '../__utils/fixture.js'
import { initLogger } from '../__utils/init-logger.js'

describe('class: ConfigValidator', () => {
  const logger = initLogger()
  const validator: ConfigValidator = new ConfigValidator(configFileSchema, logger)

  it('returns for a valid configuration', async () => {
    const fixture = new Fixture('config-files/valid/all-keys.yml')
    const config = await fixture.parse()

    expect(() => {
      validator.validate(config)
    }).not.toThrow()
  })

  it('allows for an empty elements object in jsx scope', async () => {
    const fixture = new Fixture('config-files/valid/empty-jsx-elements.yml')
    const config = await fixture.parse()

    expect(() => {
      validator.validate(config)
    }).not.toThrow()
  })

  it('does not allow extra properties', async () => {
    const fixture = new Fixture('config-files/invalid/extra-key.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

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

  it('requires version', async () => {
    const fixture = new Fixture('config-files/invalid/missing-keys/missing-version.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '',
        keyword: 'required',
        message: "must have required property 'version'",
        params: {
          missingProperty: 'version'
        }
      }
    ])
  })

  it('requires projectId', async () => {
    const fixture = new Fixture('config-files/invalid/missing-keys/missing-project-id.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '',
        keyword: 'required',
        message: "must have required property 'projectId'",
        params: {
          missingProperty: 'projectId'
        }
      }
    ])
  })

  it('requires collect', async () => {
    const fixture = new Fixture('config-files/invalid/missing-keys/missing-collect.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '',
        keyword: 'required',
        message: "must have required property 'collect'",
        params: {
          missingProperty: 'collect'
        }
      }
    ])
  })

  it('requires endpoint', async () => {
    const fixture = new Fixture('config-files/invalid/missing-keys/missing-endpoint.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '',
        keyword: 'required',
        message: "must have required property 'endpoint'",
        params: {
          missingProperty: 'endpoint'
        }
      }
    ])
  })

  it('requires at least one property in npm scope', async () => {
    const fixture = new Fixture('config-files/invalid/missing-keys/missing-npm-keys.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '/collect/npm',
        keyword: 'minProperties',
        message: 'must NOT have fewer than 1 properties',
        params: {
          limit: 1
        }
      }
    ])
  })

  it('requires at least one property in jsx scope', async () => {
    const fixture = new Fixture('config-files/invalid/missing-keys/missing-jsx-keys.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '/collect/jsx',
        keyword: 'minProperties',
        message: 'must NOT have fewer than 1 properties',
        params: {
          limit: 1
        }
      }
    ])
  })

  it('requires at least one name if allowedAttributeNames is defined', async () => {
    const fixture = new Fixture('config-files/invalid/empty-allowed-attribute-names.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '/collect/jsx/elements/allowedAttributeNames',
        keyword: 'minItems',
        message: 'must NOT have fewer than 1 items',
        params: {
          limit: 1
        }
      }
    ])
  })

  it('requires at least one value if allowedAttributeStringValues is defined', async () => {
    const fixture = new Fixture('config-files/invalid/empty-allowed-attribute-string-values.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '/collect/jsx/elements/allowedAttributeStringValues',
        keyword: 'minItems',
        message: 'must NOT have fewer than 1 items',
        params: {
          limit: 1
        }
      }
    ])
  })

  it('is able to identify more than one error', async () => {
    const fixture = new Fixture('config-files/invalid/multiple-errors.yml')
    const config = await fixture.parse()
    let err

    try {
      validator.validate(config)
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(ConfigValidationError)

    expect((err as ConfigValidationError).errors).toStrictEqual([
      {
        instancePath: '',
        keyword: 'required',
        message: "must have required property 'version'",
        params: {
          missingProperty: 'version'
        }
      },
      {
        instancePath: '',
        keyword: 'required',
        message: "must have required property 'endpoint'",
        params: {
          missingProperty: 'endpoint'
        }
      },
      {
        instancePath: '/collect/jsx/elements/allowedAttributeStringValues',
        keyword: 'minItems',
        message: 'must NOT have fewer than 1 items',
        params: {
          limit: 1
        }
      }
    ])
  })
})
