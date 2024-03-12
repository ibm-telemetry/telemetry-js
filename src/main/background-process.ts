/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json'
import { Command } from 'commander'

import { Environment } from './core/environment.js'
import { createLogFilePath } from './core/log/create-log-file-path.js'
import { Logger } from './core/log/logger.js'
import { IbmTelemetry } from './ibm-telemetry.js'

interface CommandLineOptions {
  config: string
  log?: string
}

/**
 * Sets up Commander, registers the command action, and invokes the action.
 */
function run() {
  try {
    const program = new Command()
      .description('Collect telemetry data for a package.')
      .requiredOption('--config <config-path>', 'Path to a telemetry configuration file')
      .option('--log <log-path>', 'Path to temp log file')
      .action(collect)

    program.parseAsync().catch((err) => {
      // As a failsafe, catch any uncaught exception, print it to stderr, and silently exit
      console.error(err)
    })
  } catch (err) {
    // As a failsafe, catch any uncaught exception, print it to stderr, and silently exit
    console.error(err)
  }
}

/**
 * This is the main entrypoint for telemetry collection.
 *
 * @param opts - The command line options provided when the program was executed.
 */
async function collect(opts: CommandLineOptions) {
  const date = new Date().toISOString()
  const logFilePath = opts.log ?? createLogFilePath(date)
  const logger = new Logger(logFilePath)
  const environment = new Environment()

  const ibmTelemetry = new IbmTelemetry(opts.config, configSchemaJson, environment, logger)

  try {
    await ibmTelemetry.run()
  } catch (err) {
    // Catch any exception thrown, log it, and quietly exit
    if (err instanceof Error) {
      logger.error(err)
    } else {
      logger.error(String(err))
    }
  }

  await logger.close()
}

run()
