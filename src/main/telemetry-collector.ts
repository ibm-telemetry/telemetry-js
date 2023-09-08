/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'node:fs/promises'

import { ConfigValidator } from './core/config/config-validator.js'
import { type Logger } from './core/log/logger.js'
import { parseYamlFile } from './core/parse-yaml-file.js'

/**
 *
 */
export class TelemetryCollector {
  private readonly configPath: string
  private readonly logger: Logger

  /**
   *
   * @param configPath
   * @param logger
   */
  public constructor(configPath: string, logger: Logger) {
    this.configPath = configPath
    this.logger = logger
  }

  /**
   *
   */
  public async run() {
    /*
    - get back the config file object
    - initialize open telemetry
    - instantiate a bunch of scopes
    - run the scopes
    - instantiate an exporter
    - transmit the data to the remote server
    */
    // TODO: this needs to come from someplace else
    const schemaFile = 'src/schemas/telemetrics-config.schema.json'
    const schemaFileContents = (await readFile(schemaFile)).toString()
    const configValidator = new ConfigValidator(JSON.parse(schemaFileContents))

    const configData = parseYamlFile(this.configPath)
    configValidator.validate(configData)

    console.log(this.configPath)
  }
}
