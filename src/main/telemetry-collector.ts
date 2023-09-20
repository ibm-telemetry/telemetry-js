/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'node:fs/promises'

import { type Schema as Config } from '../schemas/Schema.js'
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
  private readonly configSchemaPath: string
  private readonly logger: Logger

  /**
   * Constructs a new telemetry collector.
   *
   * @param configPath - Path to a config file.
   * @param configSchemaPath - Path to a schema against which to validate the config file.
   * @param logger - A logger instance.
   */
  public constructor(configPath: string, configSchemaPath: string, logger: Logger) {
    this.configPath = configPath
    this.configSchemaPath = configSchemaPath
    this.logger = logger
  }

  /**
   * Runs telemetry data collection.
   */
  @Trace()
  public async run() {
    const date = new Date().toISOString()
    await this.logger.debug('Date: ' + date)

    const schemaFileContents = (await readFile(this.configSchemaPath)).toString()
    await this.logger.debug('Schema: ' + schemaFileContents)
    const configValidator = new ConfigValidator(JSON.parse(schemaFileContents), this.logger)

    const config = await parseYamlFile(this.configPath)
    await this.logger.debug('Config: ' + JSON.stringify(config, undefined, 2))

    const cwd = process.cwd()
    await this.logger.debug('cwd: ' + cwd)

    const projectRoot = await getProjectRoot(cwd, this.logger)
    await this.logger.debug('projectRoot: ' + projectRoot)

    if (!configValidator.validate(config)) {
      // This will never be hit, but it allows code after this block to see the configData as
      // being of type "Schema"
      return
    }

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
  public runScopes(cwd: string, root: string, config: Config) {
    const promises = []

    for (const scopeName of Object.keys(config.collect) as Array<keyof Config['collect']>) {
      const ScopeClass = scopeRegistry[scopeName]

      if (ScopeClass === undefined) {
        throw new UnknownScopeError(scopeName)
      }

      const scopeInstance: Scope = Reflect.construct(ScopeClass, [cwd, root, config, this.logger])

      // Catch here so that all scopes get a chance to run
      promises.push(
        scopeInstance
          .run()
          .then(async () => {
            await this.logger.debug('Scope succeeded: ' + scopeName)
          })
          .catch(async (reason) => {
            await this.logger.error('Scope failed: ' + scopeName)

            if (reason instanceof Error) {
              await this.logger.error(reason)
            } else {
              await this.logger.error(String(reason))
            }
          })
      )
    }

    return promises
  }
}
