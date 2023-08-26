/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Ajv from 'ajv'
// eslint-disable-next-line n/no-unpublished-import -- TODOASKJOE
import { createGenerator } from 'ts-json-schema-generator'

import { type Schema } from './Schema.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
const ajv = new (Ajv as any)({ allErrors: true, verbose: true })

const generatorConfig = {
  path: 'src/schemas/Schema.ts',
  type: 'Schema'
}

const schema = createGenerator(generatorConfig).createSchema(generatorConfig.type)
/**
 * Given a JavaScript object and a JSON schema, obtains list of errors regarding the object
 * structure and content.
 *
 * @param content - JavaScript object to be evaluated against schema.
 * @returns Array of AJV error objects, empty array if valid content.
 */
export const getConfigObjectValidationErrors = (content: Schema) => {
  const validatorFunction = ajv.compile(schema)
  const isValid: boolean = validatorFunction(content)

  if (isValid) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODOASKJOE
  return validatorFunction.errors.map((err: any) => {
    const { instancePath, keyword, message, params } = err
    return {
      instancePath, keyword, message, params
    }
  })
}
