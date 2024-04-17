/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as net from 'node:net'
import * as os from 'node:os'
import * as path from 'node:path'

import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json' assert { type: 'json' }
import * as commander from 'commander'

import { Environment } from './core/environment.js'
import { createLogFilePath } from './core/log/create-log-file-path.js'
import { Logger } from './core/log/logger.js'
import { IbmTelemetry } from './ibm-telemetry.js'

interface CommandLineOptions {
  config: string
  log?: string
}

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
      .action(runChooChooTrain)

    program.parseAsync().catch((err) => {
      // As a failsafe, catch any uncaught exception, print it to stderr, and silently exit
      console.error(err)
    })
  } catch (err) {
    // As a failsafe, catch any uncaught exception, print it to stderr, and silently exit
    console.error(err)
  }
}

const MAX_BACKLOG = 20
const MAX_RETRIES = 3
const IPC_ADDR = path.join(os.tmpdir(), 'ibmtelemetry-ipc')

async function runChooChooTrain(opts: CommandLineOptions) {
  const date = new Date().toISOString()
  const logFilePath = opts.log ?? createLogFilePath(date)
  const logger = new Logger(logFilePath)

  // loop until connection (either server or client)
  // Decide if we are a client or the server

  let connection: net.Socket | net.Server | undefined

  for (let i = 0; i < MAX_RETRIES && !connection; i++) {
    // Try to be the server
    try {
      connection = await createServerSocket()
    } catch {}

    if (!connection) {
      // try to be the client
      try {
        connection = createClientSocket()
      } catch {}
    }
  }

  // give up 🥲
  if (!connection) {
    return
  }

  try {
    if (connection instanceof net.Server) {
      await conductChooChooTrain(
        connection,
        { cwd: new Environment().cwd, configFilePath: opts.config },
        logger
      )
    } else {
      await sendWorkToServer(
        connection,
        { cwd: new Environment().cwd, configFilePath: opts.config },
        logger
      )
    }
  } finally {
    await logger.close()
  }
}

interface TrainCar {
  cwd: string
  configFilePath: string
}

const workQueue: TrainCar[] = []

async function conductChooChooTrain(
  // TODO: can we register the event handlers at this point?
  connection: net.Server,
  myWork: TrainCar,
  logger: Logger
) {
  logger.debug('We are the conductor of the choo-choo train')

  // we are the server
  // We need to add our own work to the queue
  workQueue.push(myWork)

  // queue is not empty
  // - loop until no more messages in the queue
  while (workQueue.length > 0) {
    const currentTrainCar = workQueue.shift()

    logger.debug('processing work from queue: ', JSON.stringify(currentTrainCar))

    if (!currentTrainCar) {
      return
    }

    // collect for current car
    await collect(
      new Environment({ cwd: currentTrainCar.cwd }),
      currentTrainCar.configFilePath,
      logger
    )
  }

  connection.close()
}

function sendWorkToServer(socket: net.Socket, work: TrainCar, logger: Logger) {
  return new Promise((resolve, reject) => {
    // we are the client
    // - send my data down the IPC pipe
    logger.debug('Sending work through IPC: ', JSON.stringify(work))

    socket.on('close', resolve)
    socket.on('error', reject)
    socket.on('timeout', reject)

    socket.write(Buffer.from(JSON.stringify(work)))
    socket.end()
  })
}

function createClientSocket(): net.Socket {
  return net.connect(IPC_ADDR)
}

async function createServerSocket(): Promise<net.Server> {
  return new Promise((resolve, reject) => {
    const server = net.createServer({})

    server.on('connection', (socket) => {
      let buf = ''
      socket.on('data', (data) => {
        buf += data.toString()
      })
      socket.on('close', () => {
        const obj = JSON.parse(buf)

        workQueue.push(obj)
      })
    })
    server.on('listening', () => {
      resolve(server)
    })
    server.on('error', (err) => {
      reject(err)
    })

    process.on('SIGINT', () => server.close())
    process.on('SIGTERM', () => server.close())

    server.listen(IPC_ADDR, MAX_BACKLOG)
  })
}

/**
 * This is the main entrypoint for telemetry collection.
 *
 * @param environment - Environment variable configuration for this run.
 * @param configFilePath - Path to a config file.
 * @param logger - A logger instance.
 */
async function collect(environment: Environment, configFilePath: string, logger: Logger) {
  const ibmTelemetry = new IbmTelemetry(configFilePath, configSchemaJson, environment, logger)

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
}

run()
