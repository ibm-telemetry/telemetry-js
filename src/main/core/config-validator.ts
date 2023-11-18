/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import ajv, { type Schema, type ValidateFunction } from 'ajv'

import { ConfigValidationError } from '../exceptions/config-validation-error.js'
import { Loggable } from './log/loggable.js'
import { type Logger } from './log/logger.js'
import { Trace } from './log/trace.js'

const Ajv = ajv.default

/**
 * Class that validates a telemetry configuration file. Instances of this class should not be used
 * to analyze more than one config file. Instead, create new instances for separate validations.
 */
export class ConfigValidator extends Loggable {
  private readonly ajvValidate: ValidateFunction<ConfigSchema>

  /**
   * Constructs a new config file validator based on the provided config file schema.
   *
   * @param schema - Config file schema object.
   * @param logger - A logger instance.
   */
  public constructor(schema: Schema, logger: Logger) {
    super(logger)
    this.ajvValidate = new Ajv({ allErrors: true, verbose: true }).compile(schema)
  }

  /**
   * Validates a given given a JavaScript object representing a config file, returning if the input
   * passed validation, and throwing an exception otherwise.
   *
   * @param content - Input data to be evaluated against the schema.
   * @throws `ConfigValidationError` if the file did not pass schema validation.
   */
  @Trace()
  public validate(content: unknown): asserts content is ConfigSchema {
    if (!this.ajvValidate(content)) {
      throw new ConfigValidationError(
        // Construct an array of partial error objects to cut down on log/output noise
        this.ajvValidate.errors?.map((err) => {
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
