/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json'
import { Command } from 'commander'

import { createLogFilePath } from './core/log/create-log-file-path.js'
import { Logger } from './core/log/logger.js'
import { TelemetryCollector } from './telemetry-collector.js'

interface CommandLineOptions {
  config: string
}

/**
 * Sets up Commander, registers the command action, and invokes the action.
 */
function run() {
  const program = new Command()
    .description('Collect telemetry data for a package.')
    .requiredOption('--config <config-path>', 'Path to a telemetry configuration file')
    .action(collect)

  program.parseAsync().catch((err) => {
    // As a failsafe, this catches any uncaught exception, prints it to stderr, and silently exits
    console.error(err)
  })
}

/**
 * This is the main entrypoint for telemetry collection.
 *
 * @param opts - The command line options provided when the program was executed.
 */
async function collect(opts: CommandLineOptions) {
  const date = new Date().toISOString()
  const logFilePath = createLogFilePath(date)
  const logger = new Logger(logFilePath)

  const telemetryCollector = new TelemetryCollector(opts.config, configSchemaJson, logger)

  try {
    await telemetryCollector.run()
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
