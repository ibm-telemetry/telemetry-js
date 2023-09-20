/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Attributes } from '@opentelemetry/api'

import { anonymize } from '../../../core/anonymize.js'
import { ScopeMetric } from '../../../core/scope-metric.js'
import { type ElementData } from '../interfaces.js'

/**
 * JSX scope metric that generates an element.count individual metric for a given elements.
 */
export class ElementMetric extends ScopeMetric {
  public override name: string
  private readonly data: ElementData

  /**
   * Constructs a DependencyMetric.
   *
   * @param data - Object containing name and version to extract data to generate metric from.
   */
  public constructor(data: ElementData) {
    super()
    this.name = 'element.count'
    this.data = data
  }

  public override get attributes(): Attributes {
    // TODO: this needs to do the substitutions
    // TODOASKJOE
    return anonymize(this.data,
      {
        // TODOASKJOE: what to pass to the anonimization function to substitute the unknown attributess
        hash: [],
        substitute: []
      }
    )
  }
}
