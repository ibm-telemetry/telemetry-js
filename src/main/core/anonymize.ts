/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Attributes } from '@opentelemetry/api'
import { createHash } from 'crypto'

type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T]

interface AnonymizeConfig<T extends Attributes> {
  hash?: Array<keyof T>
  substitute?: Array<keyof T>
}

// 1. substitute names (and their values) for attribute names that aren't in allowedAttributeNames
// 2. substitute values that aren't in allowedAttributeValues

const roughFormat = {
  name: 'element.count',
  unit: '',
  sum: {
    dataPoints: [
      {
        attributes: [
          {
            //
            // Full-text version of the analyzed element.
            //
            key: 'raw',
            value: { stringValue: "<ExampleElement exampleAttribute='exampleString'>" }
          },
          {
            //
            // Name of the JSXElement.
            //
            key: 'name',
            value: { stringValue: 'ExampleElement' }
          },
          {
            //
            // Sorted list of collected attribute names on the element.
            //
            key: 'attributeNames',
            value: ['exampleAttribute']
          },
          {
            //
            // List of collected attribute values on the element. The indexes of these values
            // correspond to the indexes of the attributeNames. E.g. `attributeValues[0]` is the
            // value for `attributeNames[0]`.
            //
            key: 'attributeValues',
            value: ['exampleString']
          }
        ],
        asInt: '123'
      }
    ]
  }
}

const allowedAttributeNames = ['goodName1', 'goodName2']
const allowedAttributeValues = ['good value 1']
const exampleObj = {
  raw: '<Button goodName1="good value 1" goodName2="secret value" secret1="good value 1" secret2="secret value" />',
  attributes: {
    goodName1: 'good value 1', // no change
    goodName2: 'secret value', // sub value
    secret1: 'good value 1', // sub name and value
    secret2: 'secret value' // sub name and value
  }
}

const result = {
  raw: 'abc123abc123abc123abc123',
  attributes: {
    goodName1: 'good value 1',
    goodName2: '[redacted1]',
    '[redacted2]': '[redacted3]',
    '[redacted4]': '[redacted1]'
  }
}

const toMakeTheResult = anonymize(exampleObj, {hash: ['raw']})
toMakeTheResult.attributes = anonymize(exampleObj.attributes, {substitute: []}) // doesn't work because need the config stuff

const toMakeTheResultBetter = hash(exampleObj, ['raw'])
const toMakeTheResultBetter.attributes = substitute(exampleObj.attributes, allowedAttributeNames, allowedAttributeValues) // <---

const superSecretStuff = {}

function substitute() {
  if (theVal in superSecretStuff) {
    return superSecretStuff[theVal]
  } else {
    const id = makeNewRedactedIdentifier()
    superSecretStuff[theVal] = id
  }
}




/**
 * Anonymizes incoming raw data. The keys to be anonymized are specified in the config object
 * under either the `hash` key or the `substitute` key.
 *
 * @param raw - The attributes to anonymize.
 * @param config - The keys to either hash or substitute.
 * @returns The raw object will all specified keys replaced with anonymized versions of their
 * values.
 */
export function anonymize<T extends Attributes>(
  raw: T,
  config: RequireAtLeastOne<AnonymizeConfig<T>>
) {
  const anonymizedEntries = Object.entries(raw).map(([key, value]) => {
    if (typeof value !== 'string') {
      return { key, value }
    }

    if (config.hash?.includes(key) ?? false) {
      const hash = createHash('sha256')
      hash.update(value)
      return { key, value: hash.digest('hex') }
    }

    if (config.substitute?.includes(key) ?? false) {
      // TODO: implement this logic
      return { key, value: 'substituted!' }
    }

    return { key, value }
  })

  return anonymizedEntries.reduce<Attributes>((prev, cur) => {
    prev[cur.key] = cur.value
    return prev
  }, {})
}
