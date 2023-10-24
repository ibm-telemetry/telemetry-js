/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { type Schema } from 'ajv'

import { anonymize } from './core/anonymize.js'
import { ConfigValidator } from './core/config/config-validator.js'
import { getProjectRoot } from './core/get-project-root.js'
import { initializeOpenTelemetry } from './core/initialize-open-telemetry.js'
import { type Logger } from './core/log/logger.js'
import { Trace } from './core/log/trace.js'
import { parseYamlFile } from './core/parse-yaml-file.js'
import * as ResourceAttributes from './core/resource-attributes.js'
import { runCommand } from './core/run-command.js'
import { type Scope } from './core/scope.js'
import { tokenizeRepository } from './core/tokenize-repository.js'
import { UnknownScopeError } from './exceptions/unknown-scope-error.js'
import { getTelemetryPackageData } from './scopes/npm/get-telemetry-package-data.js'
import { scopeRegistry } from './scopes/scope-registry.js'

/**
 * Instantiable class capable of collecting project-wide JS-based telemetry data.
 */
export class TelemetryCollector {
  private readonly configPath: string
  private readonly configSchemaJson: Schema
  private readonly logger: Logger

  /**
   * Constructs a new telemetry collector.
   *
   * @param configPath - Path to a config file.
   * @param configSchemaJson - Path to a schema against which to validate the config file.
   * @param logger - A logger instance.
   */
  public constructor(configPath: string, configSchemaJson: Schema, logger: Logger) {
    this.configPath = configPath
    this.configSchemaJson = configSchemaJson
    this.logger = logger
  }

  /**
   * Runs telemetry data collection.
   */
  @Trace()
  public async run() {
    const date = new Date().toISOString()
    this.logger.debug('Date: ' + date)

    this.logger.debug('Schema: ' + JSON.stringify(this.configSchemaJson))
    const configValidator: ConfigValidator = new ConfigValidator(this.configSchemaJson, this.logger)

    const config = await parseYamlFile(this.configPath)
    this.logger.debug('Config: ' + JSON.stringify(config, undefined, 2))

    const cwd = process.cwd()
    this.logger.debug('cwd: ' + cwd)

    const projectRoot = await getProjectRoot(cwd, this.logger)
    this.logger.debug('projectRoot: ' + projectRoot)

    // This will throw if config does not conform to ConfigSchema
    configValidator.validate(config)

    // TODO: move this logic elsewhere
    // TODO: handle non-existant remote
    const gitOrigin = await runCommand('git remote get-url origin', this.logger)
    const repository = tokenizeRepository(gitOrigin.stdout)
    const emitterInfo = await getTelemetryPackageData(this.logger)

    const metricReader = initializeOpenTelemetry(
      anonymize(
        {
          [ResourceAttributes.EMITTER_NAME]: emitterInfo.name,
          [ResourceAttributes.EMITTER_VERSION]: emitterInfo.version,
          [ResourceAttributes.PROJECT_ID]: config.projectId,
          [ResourceAttributes.ANALYZED_RAW]: gitOrigin.stdout,
          [ResourceAttributes.ANALYZED_HOST]: repository.host,
          [ResourceAttributes.ANALYZED_OWNER]: repository.owner,
          [ResourceAttributes.ANALYZED_REPOSITORY]: repository.repository,
          [ResourceAttributes.DATE]: date
        },
        {
          hash: [
            ResourceAttributes.ANALYZED_RAW,
            ResourceAttributes.ANALYZED_HOST,
            ResourceAttributes.ANALYZED_OWNER,
            ResourceAttributes.ANALYZED_REPOSITORY
          ]
        }
      )
    )

    const promises = this.runScopes(cwd, projectRoot, config)

    await Promise.allSettled(promises)

    const results = await metricReader.collect()

    /*
    - instantiate an exporter
    - transmit the data to the remote server
    */

    // TODO: remove this test line
    console.log(JSON.stringify(results, undefined, 2))

    this.logger.debug('Collection results:')
    this.logger.debug(JSON.stringify(results, undefined, 2))
  }

  /**
   * Run all scopes defined in the provided config file against the provided cwd and root
   * directories.
   *
   * @param cwd - The current working directory of telemetry data collection.
   * @param root - The root directory of the project being analyzed.
   * @param config - The provided config.
   * @throws An error if an unknown scope is encountered in the config object.
   * @returns A set of promises. One per executing scope.
   */
  @Trace()
  public runScopes(cwd: string, root: string, config: ConfigSchema) {
    const promises = []

    for (const scopeName of Object.keys(config.collect) as Array<keyof ConfigSchema['collect']>) {
      const ScopeClass = scopeRegistry[scopeName]

      if (ScopeClass === undefined) {
        throw new UnknownScopeError(scopeName)
      }

      const scopeInstance: Scope = Reflect.construct(ScopeClass, [cwd, root, config, this.logger])

      // Catch here so that all scopes get a chance to run
      promises.push(
        scopeInstance
          .run()
          .then(() => {
            this.logger.debug('Scope succeeded: ' + scopeName)
          })
          .catch((reason) => {
            this.logger.error('Scope failed: ' + scopeName)

            if (reason instanceof Error) {
              this.logger.error(reason)
            } else {
              this.logger.error(String(reason))
            }
          })
      )
    }

    return promises
  }
}
