/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CustomResourceAttributes } from '@ibm/telemetry-attributes-js'
import { type ConfigSchema } from '@ibm/telemetry-config-schema'
import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json' assert { type: 'json' }
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import { AggregationTemporality, type ResourceMetrics } from '@opentelemetry/sdk-metrics'

import type { Environment } from './core/environment.js'
import { getRepositoryRoot } from './core/get-repository-root.js'
import { type Logger } from './core/log/logger.js'
import { safeStringify } from './core/log/safe-stringify.js'
import { Trace } from './core/log/trace.js'
import { OpenTelemetryContext } from './core/open-telemetry-context.js'
import { type Scope } from './core/scope.js'
import { UnknownScopeError } from './exceptions/unknown-scope-error.js'
import { getTelemetryPackageData } from './scopes/npm/get-telemetry-package-data.js'
import { scopeRegistry } from './scopes/scope-registry.js'

/**
 * Instantiable class capable of collecting project-wide JS-based telemetry data.
 */
export class IbmTelemetry {
  private readonly config: ConfigSchema
  private readonly environment: Environment
  private readonly gitInfo: object
  private readonly logger: Logger

  /**
   * Constructs a new telemetry collector.
   *
   * @param config - Parsed configFile object.
   * @param environment - Environment variable configuration for this run.
   * @param gitInfo - Object containing project git information.
   * @param logger - A logger instance.
   */
  public constructor(
    config: ConfigSchema,
    environment: Environment,
    gitInfo: object,
    logger: Logger
  ) {
    this.config = config
    this.environment = environment
    this.gitInfo = gitInfo
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

    this.logger.debug('Schema: ' + JSON.stringify(configSchemaJson))

    this.logger.debug('Config: ' + JSON.stringify(this.config, undefined, 2))

    const cwd = this.environment.cwd
    this.logger.debug('cwd: ' + cwd)

    const projectRoot = await getRepositoryRoot(cwd, this.logger)
    this.logger.debug('projectRoot: ' + projectRoot)

    const emitterInfo = await getTelemetryPackageData(this.logger)
    const otelContext = OpenTelemetryContext.getInstance(true)

    // values are already previously hashed
    const documentObject = {
      [CustomResourceAttributes.TELEMETRY_EMITTER_NAME]: emitterInfo.name,
      [CustomResourceAttributes.TELEMETRY_EMITTER_VERSION]: emitterInfo.version,
      [CustomResourceAttributes.PROJECT_ID]: this.config.projectId,
      ...this.gitInfo,
      [CustomResourceAttributes.DATE]: date
    }

    otelContext.setAttributes(documentObject)

    const promises = this.runScopes(cwd, projectRoot, this.config)

    await Promise.allSettled(promises)

    const results = await otelContext.getMetricReader().collect()

    this.logger.debug('Collection results:')
    this.logger.debug(JSON.stringify(results, undefined, 2))

    this.environment.isExportEnabled &&
      (await this.emitMetrics(results.resourceMetrics, this.config))
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

  /**
   * Exports collected metrics (if any).
   *
   * @param metrics - ResourceMetrics instance of pre-collected metrics to export.
   * @param config - The provided config.
   * @returns Promise that resolves to undefined.
   */
  @Trace()
  public async emitMetrics(metrics: ResourceMetrics, config: ConfigSchema) {
    // no metrics, do not export
    if (metrics.scopeMetrics.length <= 0) {
      return undefined
    }

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
