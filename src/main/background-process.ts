/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as os from 'node:os'
import * as path from 'node:path'

import * as commander from 'commander'

import { ChooChooTrain } from './core/choo-choo-train.js'
import { Environment } from './core/environment.js'
import { createLogFilePath } from './core/log/create-log-file-path.js'
import { Logger } from './core/log/logger.js'

interface CommandLineOptions {
  config: string
  log?: string
}

const IPC_ADDR = path.join(os.tmpdir(), 'ibmtelemetry-ipc')

const { Command } = commander

/**
 * Sets up Commander, registers the command action, and invokes the action.
 */
function run() {
  try {
    const program = new Command()
      .description('Collect telemetry data for a package.')
      .requiredOption('--config <config-path>', 'Path to a telemetry configuration file')
      .option('--log <log-path>', 'Path to temp log file')
      .action(runBackgroundProcess)

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
async function runBackgroundProcess(opts: CommandLineOptions) {
  const date = new Date().toISOString()
  const logFilePath = opts.log ?? createLogFilePath(date)
  const logger = new Logger(logFilePath)
  const fullConfigPath = path.resolve(opts.config)

  logger.traceEnter('', 'runBackgroundProcess', [opts])

  const chooChooTrain = new ChooChooTrain(IPC_ADDR, new Environment(), fullConfigPath, logger)

  try {
    await chooChooTrain.run()
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err)
    } else {
      logger.error(String(err))
    }
  }

  logger.traceExit('', 'runBackgroundProcess', undefined)
  await logger.close()
}

run()
