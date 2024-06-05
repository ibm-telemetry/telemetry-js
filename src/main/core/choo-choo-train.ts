/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as net from 'node:net'

import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json' assert { type:
  'json' }

import { IbmTelemetry } from '../ibm-telemetry.js'
import { Environment } from './environment.js'
import { Loggable } from './log/loggable.js'
import type { Logger } from './log/logger.js'
import { Trace } from './log/trace.js'

const MAX_RETRIES = 3
const MAX_BACKLOG = 64

interface Work {
  cwd: string
  configFilePath: string
}

/**
 * Encapsulates all logic for orchestrating the running of multiple telemetry processes.
 */
export class ChooChooTrain extends Loggable {
  private readonly workQueue: Work[] = []
  private readonly ipcAddr: string

  /**
   * Constructs a new ChooChooTrain instance.
   *
   * @param ipcAddr - The address of the IPC pipe.
   * @param environment - Environment variable configuration for this run.
   * @param configFilePath - Path to a config file.
   * @param logger - A logger instance.
   */
  public constructor(
    ipcAddr: string,
    environment: Environment,
    configFilePath: string,
    logger: Logger
  ) {
    super(logger)

    this.ipcAddr = ipcAddr

    this.workQueue.push({ cwd: environment.cwd, configFilePath })
  }

  /**
   * Establishes ourself as either the conductor or a client.
   * If we are the conductor, run all work in the queue (including our work).
   * If we are a client, send our work to the conductor.
   */
  public async run(): Promise<void> {
    let connection: net.Socket | net.Server | undefined

    for (let i = 0; i < MAX_RETRIES && !connection; i++) {
      // Try to be the server
      try {
        connection = await this.createServerSocket(this.handleServerConnection.bind(this))
      } catch {}

      if (!connection) {
        // Try to be the client
        try {
          connection = await this.createClientSocket()
        } catch {}
      }
    }

    // give up 🥲
    if (!connection) {
      this.logger.debug('Could not establish server or client connection. Exiting')
      return
    }

    try {
      if (connection instanceof net.Server) {
        await this.doWork(connection)
      } else {
        await this.sendWorkToConductor(connection)
      }
    } finally {
      await this.logger.close()
    }
  }

  @Trace({ argFormatter: () => '[onConnect]' })
  private async createServerSocket(onConnect: (socket: net.Socket) => void): Promise<net.Server> {
    return new Promise((resolve, reject) => {
      const server = net.createServer({})

      server.on('connection', onConnect)
      server.on('listening', () => {
        resolve(server)
      })
      server.on('error', reject)

      // Set up signal handler to gracefully close the IPC socket
      process.on('SIGINT', server.close)
      process.on('SIGTERM', server.close)

      server.listen(this.ipcAddr, MAX_BACKLOG)
    })
  }

  @Trace()
  private createClientSocket(): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      const socket = net.connect(this.ipcAddr)

      socket.on('connect', () => resolve(socket))
      socket.on('error', reject)
    })
  }

  @Trace({ argFormatter: () => '[socket]' })
  private handleServerConnection(socket: net.Socket) {
    let buf = ''

    socket.on('data', (data) => {
      buf += data.toString()
    })

    socket.on('close', () => {
      const obj = JSON.parse(buf)

      this.workQueue.push(obj)
    })
  }

  /**
   * We are the client. Send work through the IPC pipe to the conductor.
   *
   * @param socket - Client socket connection to use to communicate to server.
   * @returns Void.
   */
  @Trace({ argFormatter: () => '[socket]' })
  private sendWorkToConductor(socket: net.Socket) {
    return new Promise((resolve, reject) => {
      const work = this.workQueue.shift()

      this.logger.debug('Sending work through IPC: ', JSON.stringify(work))

      socket.on('close', resolve)
      socket.on('error', reject)
      socket.on('timeout', reject)

      socket.write(Buffer.from(JSON.stringify(work)))
      socket.end()
    })
  }

  @Trace({ argFormatter: () => '[server]' })
  private async doWork(server: net.Server) {
    this.logger.debug(
      'We are the conductor of the choo-choo train. Running all available work in queue'
    )

    // Consume work until the queue is empty
    while (this.workQueue.length > 0) {
      this.logger.debug('Queue length', this.workQueue.length)

      const currentWork = this.workQueue.shift()

      if (!currentWork) {
        return
      }

      // collect for current work
      await this.collect(new Environment({ cwd: currentWork.cwd }), currentWork.configFilePath)
    }

    server.close()
  }

  /**
   * This is the main entrypoint for telemetry collection.
   *
   * @param environment - Environment variable configuration for this run.
   * @param configFilePath - Path to a config file.
   */
  @Trace()
  private async collect(environment: Environment, configFilePath: string) {
    const ibmTelemetry = new IbmTelemetry(
      configFilePath,
      configSchemaJson,
      environment,
      this.logger
    )

    try {
      await ibmTelemetry.run()
    } catch (err) {
      // Catch any exception thrown, log it, and quietly exit
      if (err instanceof Error) {
        this.logger.error(err)
      } else {
        this.logger.error(String(err))
      }
    }
  }
}
