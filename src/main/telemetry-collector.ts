/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'node:fs/promises'

import { ConfigValidator } from './core/config/config-validator.js'
import { exec } from './core/exec.js'
import { initializeOpenTelemetry } from './core/initialize-open-telemetry.js'
import { type Logger } from './core/log/logger.js'
import { Trace } from './core/log/trace.js'
import { parseYamlFile } from './core/parse-yaml-file.js'
import * as ResourceAttributes from './core/resource-attributes.js'
import { type Scope } from './core/scope.js'
import { tokenizeRepository } from './core/tokenize-repository.js'
import { UnknownScopeError } from './exceptions/unknown-scope-error.js'
import { getPackageName } from './scopes/npm/get-package-name.js'
import { getPackageVersion } from './scopes/npm/get-package-version.js'

/**
 *
 */
export class TelemetryCollector {
  private readonly configPath: string
  private readonly configSchemaPath: string
  private readonly logger: Logger
  private readonly scopes: Scope[]

  /**
   * Constructs a new telemetry collector.
   *
   * @param configPath
   * @param configSchemaPath
   * @param logger
   */
  public constructor(configPath: string, configSchemaPath: string, logger: Logger) {
    this.configPath = configPath
    this.configSchemaPath = configSchemaPath
    this.logger = logger
    this.scopes = []
  }

  /**
   * Registers a Scope class with this telemetry collector instance.
   *
   * @param scope - The scope class to register.
   */
  public registerScope(scope: Scope) {
    this.scopes.push(scope)
  }

  /**
   *
   */
  @Trace()
  public async run() {
    const date = new Date().toISOString()
    await this.logger.log('debug', 'Date: ' + date)

    const schemaFileContents = (await readFile(this.configSchemaPath)).toString()
    await this.logger.log('debug', 'Schema: ' + schemaFileContents)

    const configValidator = new ConfigValidator(JSON.parse(schemaFileContents))
    const config = await parseYamlFile(this.configPath)
    await this.logger.log('debug', 'Config: ' + JSON.stringify(config, undefined, 2))

    if (!configValidator.validate(config)) {
      // This will never be hit, but it allows code after this block to see the configData as the
      // being of type "Schema"
      return
    }

    // TODO: handle non-existant remote
    // TODO: move this logic elsewhere
    const gitOrigin = exec('git remote get-url origin')
    const repository = tokenizeRepository(gitOrigin)
    const emitterInfo = { name: getPackageName(), version: getPackageVersion() }

    const metricReader = initializeOpenTelemetry({
      [ResourceAttributes.EMITTER_NAME]: emitterInfo.name,
      [ResourceAttributes.EMITTER_VERSION]: emitterInfo.version,
      [ResourceAttributes.PROJECT_ID]: config.projectId,
      [ResourceAttributes.ANALYZED_RAW]: gitOrigin,
      [ResourceAttributes.ANALYZED_HOST]: repository.host,
      [ResourceAttributes.ANALYZED_OWNER]: repository.owner,
      [ResourceAttributes.ANALYZED_REPOSITORY]: repository.repository,
      [ResourceAttributes.DATE]: date
    })

    // Run the scopes
    const scopeResults = await Promise.allSettled(
      this.scopes.map(async (scope) => {
        await scope.run()
      })
    )

    // Log each result as either a success or failure
    await Promise.all(
      scopeResults.map(async (scopeResult, index) => {
        if (scopeResult.status === 'rejected') {
          await this.logger.log('error', 'Scope failed: ' + scopeResult.reason)
        } else {
          await this.logger.log('debug', 'Scope finished: ' + this.scopes[index]?.name)
        }
      })
    )

    const results = await metricReader.collect()

    /*
    - instantiate a bunch of scopes
    - instantiate an exporter
    - transmit the data to the remote server
    */

    // TODO: remove this test line
    console.log(JSON.stringify(results, null, 2))
  }
}
