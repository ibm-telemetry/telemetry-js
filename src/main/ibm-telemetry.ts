/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CustomResourceAttributes } from '@ibm/telemetry-attributes-js'
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import { AggregationTemporality, type ResourceMetrics } from '@opentelemetry/sdk-metrics'
import { type Schema } from 'ajv'

import { hash } from './core/anonymize/hash.js'
import { ConfigValidator } from './core/config-validator.js'
import { Environment } from './core/environment.js'
import { getProjectRoot } from './core/get-project-root.js'
import { GitInfoProvider } from './core/git-info-provider.js'
import { type Logger } from './core/log/logger.js'
import { safeStringify } from './core/log/safe-stringify.js'
import { Trace } from './core/log/trace.js'
import { OpenTelemetryContext } from './core/open-telemetry-context.js'
import { parseYamlFile } from './core/parse-yaml-file.js'
import { type Scope } from './core/scope.js'
import { UnknownScopeError } from './exceptions/unknown-scope-error.js'
import { getTelemetryPackageData } from './scopes/npm/get-telemetry-package-data.js'
import { scopeRegistry } from './scopes/scope-registry.js'

/**
 * Instantiable class capable of collecting project-wide JS-based telemetry data.
 */
export class IbmTelemetry {
  private readonly configPath: string
  private readonly configSchemaJson: Schema
  private readonly environment: Environment
  private readonly logger: Logger

  /**
   * Constructs a new telemetry collector.
   *
   * @param configPath - Path to a config file.
   * @param configSchemaJson - Path to a schema against which to validate the config file.
   * @param environment - Environment variable configuration for this run.
   * @param logger - A logger instance.
   */
  public constructor(
    configPath: string,
    configSchemaJson: Schema,
    environment: Environment,
    logger: Logger
  ) {
    this.configPath = configPath
    this.configSchemaJson = configSchemaJson
    this.environment = environment
    this.logger = logger
  }

  /**
   * Runs telemetry data collection.
   */
  @Trace()
  public async run() {
    this.logger.debug('Environment: ' + JSON.stringify(this.environment))

    if (!this.environment.isTelemetryEnabled) {
      this.logger.debug('Telemetry disabled via environment variable')
      return
    }

    if (!this.environment.isCI) {
      this.logger.debug('Telemetry disabled because not running in CI')
      return
    }

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

    const { repository, commitHash, commitTags, commitBranches } = await new GitInfoProvider(
      cwd,
      this.logger
    ).getGitInfo()
    const emitterInfo = await getTelemetryPackageData(this.logger)
    const otelContext = OpenTelemetryContext.getInstance()

    otelContext.setAttributes(
      hash(
        {
          [CustomResourceAttributes.TELEMETRY_EMITTER_NAME]: emitterInfo.name,
          [CustomResourceAttributes.TELEMETRY_EMITTER_VERSION]: emitterInfo.version,
          [CustomResourceAttributes.PROJECT_ID]: config.projectId,
          [CustomResourceAttributes.ANALYZED_COMMIT]: commitHash,
          [CustomResourceAttributes.ANALYZED_HOST]: repository.host,
          [CustomResourceAttributes.ANALYZED_OWNER]: repository.owner,
          [CustomResourceAttributes.ANALYZED_PATH]: `${repository.host ?? ''}/${
            repository.owner ?? ''
          }/${repository.repository ?? ''}`,
          [CustomResourceAttributes.ANALYZED_REPOSITORY]: repository.repository,
          [CustomResourceAttributes.ANALYZED_REFS]: [...commitTags, ...commitBranches],
          [CustomResourceAttributes.DATE]: date
        },
        [
          CustomResourceAttributes.ANALYZED_COMMIT,
          CustomResourceAttributes.ANALYZED_HOST,
          CustomResourceAttributes.ANALYZED_OWNER,
          CustomResourceAttributes.ANALYZED_PATH,
          CustomResourceAttributes.ANALYZED_REPOSITORY,
          CustomResourceAttributes.ANALYZED_REFS
        ]
      )
    )

    const promises = this.runScopes(cwd, projectRoot, config)

    await Promise.allSettled(promises)

    const results = await otelContext.getMetricReader().collect()

    this.logger.debug('Collection results:')
    this.logger.debug(JSON.stringify(results, undefined, 2))

    this.environment.isExportEnabled && (await this.emitMetrics(results.resourceMetrics, config))
  }

  /**
   * Run all scopes defined in the provided config file against the provided cwd and root
   * directories.
   *
   * @param cwd - The current working directory of telemetry data collection. This is an absolute
   * path.
   * @param root - The root directory of the project being analyzed. This is an absolute path.
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

  @Trace()
  private async emitMetrics(metrics: ResourceMetrics, config: ConfigSchema) {
    const exporter = new OTLPMetricExporter({
      url: config.endpoint,
      temporalityPreference: AggregationTemporality.DELTA,
      compression: CompressionAlgorithm.GZIP
    })

    return await new Promise((resolve) => {
      exporter.export(metrics, (result) => {
        this.logger.debug('Metrics exporter finished')
        this.logger.debug(safeStringify(result))
        resolve(undefined)
      })
    })
  }
}
