/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Attributes } from '@opentelemetry/api'
import { SemVer } from 'semver'

import { ScopeMetric } from '../../../core/scope-metric.js'

export interface DependencyData {
  name: string
  version: string
  // TODO: does this need "installer"? as well?
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
      'version.major': major.toString(),
      'version.minor': minor.toString(),
      'version.patch': patch.toString(),
      'version.preRelease': preRelease.join('.')
    }
  }

  /**
   * Extracts atomic attributes from the given package name and version.
   *
   * @returns Object containing package owner, name, major, minor, patch and preRelease versions.
   */
  private getPackageDetails() {
    const fullPackageName = this.data.name
    let owner, name

    if (fullPackageName.startsWith('@') && fullPackageName.includes('/')) {
      ;[owner, name] = fullPackageName.split('/')
    } else {
      name = fullPackageName
    }

    const { major, minor, patch, prerelease } = new SemVer(this.data.version)

    return {
      owner,
      name,
      major,
      minor,
      patch,
      preRelease: prerelease
    }
  }
}
