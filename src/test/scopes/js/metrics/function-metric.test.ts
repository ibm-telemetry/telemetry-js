/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsScopeAttributes, NpmScopeAttributes } from '@ibm/telemetry-attributes-js'
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { describe, expect, it } from 'vitest'

import { hash } from '../../../../main/core/anonymize/hash.js'
import { substitute } from '../../../../main/core/anonymize/substitute.js'
import { ComplexValue } from '../../../../main/scopes/js/complex-value.js'
import type { JsFunction, JsImport, NodeValue } from '../../../../main/scopes/js/interfaces.js'
import { FunctionMetric } from '../../../../main/scopes/js/metrics/function-metric.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../main/scopes/jsx/constants.js'
import { initLogger } from '../../../__utils/init-logger.js'

const config: ConfigSchema = {
  projectId: 'abc123',
  version: 1,
  endpoint: '',
  collect: {
    js: {
      functions: {
        allowedArgumentStringValues: ['allowedArg1', 'allowedArg2']
      }
    }
  }
}

describe('class: FunctionMetric', () => {
  const logger = initLogger()
  const jsFunction: JsFunction = {
    name: 'theFunction',
    accessPath: ['access1', 'access2', 'theFunction'],
    startPos: 0,
    endPos: 10,
    arguments: [true, 'allowedArg1', 'allowedArg2', 32, 'unallowedArg', new ComplexValue({})]
  }
  const jsImport: JsImport = {
    name: 'theFunction',
    path: 'path',
    isDefault: false,
    isAll: false
  }

  it('returns the correct attributes for a standard function', () => {
    const attributes = new FunctionMetric(
      jsFunction,
      jsImport,
      { name: 'instrumented', version: '1.0.0' },
      config,
      logger
    ).attributes
    const argMap = jsFunction.arguments.reduce<Record<string, NodeValue>>((prev, cur, index) => {
      return { ...prev, [index.toString()]: cur }
    }, {})

    const subs = substitute(argMap, Object.keys(argMap), ['allowedArg1', 'allowedArg2'])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsScopeAttributes.FUNCTION_NAME]: 'theFunction',
          [JsScopeAttributes.FUNCTION_ACCESS_PATH]: ['access1', 'access2', 'theFunction'],
          [JsScopeAttributes.FUNCTION_ARGUMENT_VALUES]: Object.values(subs).map((arg) =>
            String(arg)
          ),
          [NpmScopeAttributes.INSTRUMENTED_RAW]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [NpmScopeAttributes.INSTRUMENTED_NAME]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: undefined
        },
        [
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns the correct attributes for a renamed function', () => {
    const renamedImport = { ...jsImport, name: 'theActualName', rename: 'theFunction' }
    const attributes = new FunctionMetric(
      jsFunction,
      renamedImport,
      {
        name: 'instrumented',
        version: '1.0.0-rc.4'
      },
      config,
      logger
    ).attributes
    const argMap = jsFunction.arguments.reduce<Record<string, NodeValue>>((prev, cur, index) => {
      return { ...prev, [index.toString()]: cur }
    }, {})

    const subs = substitute(argMap, Object.keys(argMap), ['allowedArg1', 'allowedArg2'])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsScopeAttributes.FUNCTION_NAME]: 'theActualName',
          [JsScopeAttributes.FUNCTION_ACCESS_PATH]: ['access1', 'access2', 'theActualName'],
          [JsScopeAttributes.FUNCTION_ARGUMENT_VALUES]: Object.values(subs).map((arg) =>
            String(arg)
          ),
          [NpmScopeAttributes.INSTRUMENTED_RAW]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [NpmScopeAttributes.INSTRUMENTED_NAME]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0-rc.4',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: 'rc.4'
        },
        [
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })

  it('returns the correct attributes for a default function', () => {
    const defaultImport = {
      ...jsImport,
      name: DEFAULT_ELEMENT_NAME,
      rename: 'theFunction',
      isDefault: true
    }
    const attributes = new FunctionMetric(
      jsFunction,
      defaultImport,
      {
        name: 'instrumented',
        version: '1.0.0+9999'
      },
      config,
      logger
    ).attributes
    const argMap = jsFunction.arguments.reduce<Record<string, NodeValue>>((prev, cur, index) => {
      return { ...prev, [index.toString()]: cur }
    }, {})

    const subs = substitute(argMap, Object.keys(argMap), ['allowedArg1', 'allowedArg2'])

    expect(attributes).toStrictEqual(
      hash(
        {
          [JsScopeAttributes.FUNCTION_NAME]: DEFAULT_ELEMENT_NAME,
          [JsScopeAttributes.FUNCTION_ACCESS_PATH]: ['access1', 'access2', DEFAULT_ELEMENT_NAME],
          [JsScopeAttributes.FUNCTION_ARGUMENT_VALUES]: Object.values(subs).map((arg) =>
            String(arg)
          ),
          [NpmScopeAttributes.INSTRUMENTED_RAW]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_OWNER]: undefined,
          [NpmScopeAttributes.INSTRUMENTED_NAME]: 'instrumented',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_RAW]: '1.0.0+9999',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MAJOR]: '1',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_MINOR]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PATCH]: '0',
          [NpmScopeAttributes.INSTRUMENTED_VERSION_PRE_RELEASE]: undefined
        },
        [
          'npm.dependency.instrumented.raw',
          'npm.dependency.instrumented.owner',
          'npm.dependency.instrumented.name',
          'npm.dependency.instrumented.version.raw',
          'npm.dependency.instrumented.version.preRelease'
        ]
      )
    )
  })
})
