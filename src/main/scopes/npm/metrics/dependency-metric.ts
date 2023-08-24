/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Attributes } from '@opentelemetry/api'

import { ScopeMetric } from '../../../core/scope-metric.js'

export interface DependencyData {
  name: string
  version: string
}

/**
 * NPM scope metric that generates a dependency.count individual metric for a given dependency.
 */
export class DependencyMetric extends ScopeMetric {
  public override name: string
  private readonly data: DependencyData

  /**
   * Constructs a DependencyMetric.
   *
   * @param data - Object containing name and version to extract data to generate metric from.
   */
  public constructor(data: DependencyData) {
    super()
    this.name = 'dependency.count'
    this.data = data
  }

  public override get attributes(): Attributes {
    const { owner, name, major, minor, patch, preRelease } = this.getPackageDetails()
    return {
      raw: this.data.name,
      owner,
      name,
      'version.raw': this.data.version,
      'version.major': major,
      'version.minor': minor,
      'version.patch': patch,
      'version.preRelease': preRelease
    }
  }

  /**
   * Extracts atomic attributes from the given package name and version.
   *
   * @returns Object containing package owner, name, major, minor, patch and preRelease versions.
   */
  private getPackageDetails() {
    const fullPackageName = this.data.name
    let owner, name, patch, preRelease

    if (fullPackageName.startsWith('@') && fullPackageName.includes('/')) {
      ;[owner, name] = fullPackageName.split('/')
    } else {
      name = fullPackageName
    }

    const [major, minor, ...rest] = this.data.version.split('.')

    if (rest.join('.').includes('-')) {
      let additionalInformation
      ;[patch, ...additionalInformation] = rest.join('.').split('-')

      if (additionalInformation.join('').includes('+')) {
        ;[preRelease] = additionalInformation.join('').split('+')
      } else {
        preRelease = additionalInformation[0]
      }
    } else if (rest[0]?.includes('+') ?? false) {
      ;[patch] = rest[0]?.split('+')
    } else {
      patch = rest[0]
    }

    return {
      owner,
      name,
      major,
      minor,
      patch,
      preRelease
    }
  }
}
