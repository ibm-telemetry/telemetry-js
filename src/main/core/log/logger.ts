/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { appendFile } from 'node:fs/promises'

import { safeStringify } from './safe-stringify.js'
import { truncateString } from './truncate-string.js'

type Level = 'debug' | 'error'

const MAX_ARGS_STRING_LENGTH = 500 // characters
const DRAIN_INTERVAL = 250 // ms

/**
 * Logger class to log debug and error statements to a given file.
 */
export class Logger {
  private readonly filePath: string
  private readonly buffer: string[]
  private readonly drainer: NodeJS.Timeout

  /**
   * Constructs a Logger instance.
   *
   * @param filePath - Determines were the logs are stored in the filesystem.
   */
  public constructor(filePath: string) {
    this.filePath = filePath
    this.buffer = []
    this.drainer = setInterval(() => {
      void this.flush()
    }, DRAIN_INTERVAL)

    console.log('Log file:', filePath)
  }

  /**
   * Flushes the current contents of the log buffer to the log file.
   */
  public async flush() {
    const logBlock = this.buffer.join('')
    await appendFile(this.filePath, logBlock)
    this.buffer.splice(0)
  }

  /**
   * Flushes the logger and clears the log draining interval.
   */
  public async close() {
    clearInterval(this.drainer)
    await this.flush()
  }

  /**
   * Debug logs a given log message.
   *
   * @param msg - The message to log.
   */
  public debug(msg: string) {
    this.log('debug', msg)
  }

  /**
   * Error logs a given message/error.
   *
   * @param msg - The message/error to log.
   */
  public error(msg: string | Error) {
    let entry: string

    if (msg instanceof Error) {
      entry = msg.constructor.name + ' ' + msg.stack
    } else {
      entry = msg
    }

    this.log('error', entry)
  }

  /**
   * Traces function entry in a consistent way.
   *
   * @param targetName - Name of the object/class invoking the function being traced.
   * @param methodName - Name of the method/function being traced.
   * @param args - The arguments passed to the method/function.
   */
  public traceEnter(targetName: string, methodName: string, args: unknown[]) {
    const stringArgs = truncateString(String(args.map(safeStringify)), MAX_ARGS_STRING_LENGTH)

    this.debug(`-> ${targetName}::${methodName}(${stringArgs})`)
  }

  /**
   * Traces function exit in a consistent way.
   *
   * @param targetName - Name of the object/class invoking the function being traced.
   * @param methodName - Name of the method/function being traced.
   * @param result - The return value of the method/function.
   */
  public traceExit(targetName: string, methodName: string, result: unknown) {
    if (result instanceof Promise) {
      result.then(
        (value: unknown) => {
          this.debug(
            `<- ${targetName}::${methodName}(...): ${truncateString(
              safeStringify(value),
              MAX_ARGS_STRING_LENGTH
            )}`
          )
        },
        (err: unknown) => {
          this.error(`-x- ${targetName}::${methodName}(...): ${safeStringify(err)}`)
          if (err instanceof Error) {
            this.error(err)
          }
        }
      )
    } else if (result instanceof Error) {
      this.error(`-x- ${targetName}::${methodName}(...): ${safeStringify(result)}`)
      this.error(result)
    } else {
      this.debug(
        `<- ${targetName}::${methodName}(...): ${truncateString(
          safeStringify(result),
          MAX_ARGS_STRING_LENGTH
        )}`
      )
    }
  }

  /**
   * Logs a given message to the log file and (if in development mode) to the console.
   *
   * @param level - 'debug' or 'error'.
   * @param msg - Message to log.
   */
  private log(level: Level, msg: string) {
    const date = new Date().toISOString()

    this.buffer.push(level + ' ' + process.pid + ' ' + date + ' ' + msg + '\n')
  }
}
