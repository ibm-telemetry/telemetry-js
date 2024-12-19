/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as net from 'node:net'

import { CustomResourceAttributes } from '@ibm/telemetry-attributes-js'
import configSchemaJson from '@ibm/telemetry-config-schema/config.schema.json' assert { type: 'json' }

import { IbmTelemetry } from '../ibm-telemetry.js'
import { hash } from './anonymize/hash.js'
import { ConfigValidator } from './config-validator.js'
import { Environment } from './environment.js'
import { GitInfoProvider } from './git-info-provider.js'
import { Loggable } from './log/loggable.js'
import type { Logger } from './log/logger.js'
import { Trace } from './log/trace.js'
import { parseYamlFile } from './parse-yaml-file.js'

const MAX_RETRIES = 3
const MAX_BACKLOG = 64

interface LogPayload {
  message: string
  error?:
    | {
        message?: string
        stack?: string | undefined
      }
    | string
}

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
  private analyzedCommit?: string
  private analyzedPath?: string
  private analyzedProjectId?: string
  private logEndpoint?: string

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

      server.on('error', (error) => {
        this.sendLogs(
          `Conductor experienced error on project ${this.analyzedProjectId} against
          analyzed path ${this.analyzedPath} at commit ${this.analyzedCommit}`,
          error
        )
          .then(() => reject(error))
          .catch(() => reject(error)) // in case sending logs fails, we still reject promise
      })

      // Set up signal handler to gracefully close the IPC socket
      process.on('SIGINT', () => this.handleSignal(server))
      process.on('SIGTERM', () => this.handleSignal(server))

      server.listen(this.ipcAddr, MAX_BACKLOG)
    })
  }

  @Trace()
  private createClientSocket(): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      const socket = net.connect(this.ipcAddr)

      socket.on('connect', () => resolve(socket))
      socket.on('error', (error) => {
        this.sendLogs(
          `Wagon experienced error on project ${this.analyzedProjectId} against
          analyzed path ${this.analyzedPath} at commit ${this.analyzedCommit}`,
          error
        )
          .then(() => reject(error))
          .catch(() => reject(error)) // in case sending logs fails, we still reject promise
      })
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
      socket.on('error', (error) => {
        this.sendLogs(
          `Wagon experienced error sending work to conductor 
          on project ${this.analyzedProjectId} against analyzed 
          path ${this.analyzedPath} at commit ${this.analyzedCommit}`,
          error
        )
          .then(() => reject(error))
          .catch(() => reject(error)) // in case sending logs fails, we still reject promise
      })
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

    const start = performance.now()

    // Both server and clients will have the same data due to being provided from git,
    // thus we obtain the data from the conductor's first job before the loop
    const conductorWork = this.workQueue?.[0]
    if (conductorWork) {
      // TODO: I will be passing the data we get from here to ibmTelemetry()
      // We are getting the analyzedPath, commit, and projectId, so might as well
      // get everything else can make it so the function doesn't need to run twice
      await this.getRepoData(conductorWork)

      this.sendLogs(
        `The ChooChooTrain ride started for analyzed path ${this.analyzedPath} at commit ${this.analyzedCommit}`
      )
    }

    let totalWork = 0

    // Consume work until the queue is empty
    while (this.workQueue.length > 0) {
      this.logger.debug('Queue length', this.workQueue.length)

      const currentWork = this.workQueue.shift()

      if (!currentWork) {
        return
      }

      // collect for current work
      await this.collect(new Environment({ cwd: currentWork.cwd }), currentWork.configFilePath)
      totalWork++
    }

    const totalTime = (performance.now() - start).toFixed(2)

    this.sendLogs(
      `The ChooChooTrain Ride with ${totalWork} packages at analyzed path ${this.analyzedPath} 
      at commit ${this.analyzedCommit} took ${totalTime}ms`
    )

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
        this.sendLogs('Process signal error: ', err)
      } else {
        this.logger.error(String(err))
        this.sendLogs('Process signal error: ', String(err))
      }
    }
  }

  @Trace()
  private async getRepoData(work: Work) {
    const { repository, commitHash } = await new GitInfoProvider(work.cwd, this.logger).getGitInfo()

    const hashedData = hash(
      {
        [CustomResourceAttributes.ANALYZED_COMMIT]: commitHash,
        [CustomResourceAttributes.ANALYZED_PATH]: `${repository.host ?? ''}/${
          repository.owner ?? ''
        }/${repository.repository ?? ''}`
      },
      [CustomResourceAttributes.ANALYZED_COMMIT, CustomResourceAttributes.ANALYZED_PATH]
    )

    this.analyzedCommit = hashedData[CustomResourceAttributes.ANALYZED_COMMIT]
    this.analyzedPath = hashedData[CustomResourceAttributes.ANALYZED_PATH]
    const config = await parseYamlFile(work.configFilePath)
    const configValidator: ConfigValidator = new ConfigValidator(configSchemaJson, this.logger)
    configValidator.validate(config)

    this.analyzedProjectId = config.projectId
    this.logEndpoint = config.endpoint as string
  }

  @Trace()
  private handleSignal(server: net.Server) {
    server.close((err) => {
      if (err) {
        this.sendLogs('Process signal error: ', err).catch((sendErr) => {
          if (sendErr instanceof Error) {
            this.logger.error(sendErr)
          } else {
            this.logger.error(String(sendErr))
          }
        })
      }
    })
  }

  /**
   * This function handles sending logs to the collector.
   * There are two types of logs this function can send out:
   *   1. ChooChooTrain start and end logs
   *   2. Error logs.
   *
   * @param message - The message to send to collector.
   * @param error - The optional error that caused the train to crash.
   */
  @Trace()
  private async sendLogs(message: string, error?: Error | string) {
    if (this.logEndpoint === '') return

    const payload: LogPayload = {
      message: message
    }

    if (error != undefined) {
      if (error instanceof Error) {
        payload.error = {
          message: error.message,
          stack: error.stack
        }
      } else {
        payload.error = error
      }
    }

    try {
      const response = await fetch(this.logEndpoint as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        this.logger.error(`Failed to send log: ${response.statusText}`)
      }
    } catch (sendErr) {
      if (sendErr instanceof Error) {
        this.logger.error(sendErr)
      } else {
        this.logger.error(String(sendErr))
      }
    }
  }
}
