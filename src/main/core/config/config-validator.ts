/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ajv, { type JSONSchemaType, type ValidateFunction } from 'ajv'

// TODO: this should come from a separate published package
import { type Schema as ConfigFileSchema } from '../../../schemas/Schema.js'
import { ConfigValidationError } from '../../exceptions/config-validation-error.js'

const Ajv = ajv.default

/**
 * Class that validates a telemetrics configuration file. Instances of this class should not be used
 * to analyze more than one config file. Instead, create new instances for separate validations.
 */
export class ConfigValidator {
  private readonly validate: ValidateFunction<ConfigFileSchema>

  /**
   * Constructs a new config file validator based on the provided config file schema.
   *
   * @param schema - Config file schema object.
   */
  public constructor(schema: JSONSchemaType<ConfigFileSchema>) {
    this.validate = new Ajv({ allErrors: true, verbose: true }).compile(schema)
  }

  /**
   * Validates a given given a JavaScript object representing a config file, returning if the input
   * passed validation, and throwing an exception otherwise.
   *
   * @param content - JavaScript object to be evaluated against schema.
   * @throws `ConfigValidationError` if the file did not pass schema validation.
   */
  public validateConfig(content: Record<string, unknown>) {
    if (!this.validate(content)) {
      throw new ConfigValidationError(
        this.validate.errors?.map((err) => {
          const { instancePath, keyword, message, params } = err
          return {
            instancePath,
            keyword,
            message,
            params
          }
        }) ?? []
      )
    }
  }
}
