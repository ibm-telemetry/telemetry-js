/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { appendFile } from 'node:fs/promises'

import { safeStringify } from './safe-stringify.js'

type Level = 'debug' | 'error'

const DRAIN_INTERVAL = 250 // ms

let curPromiseId = 1

/**
 * Logger class to log debug and error statements to a given file.
 */
export class Logger {
  // JS-private notation is used to make this field non-enumerable
  readonly #filePath: string
  readonly #buffer: string[]
  readonly #drainer: NodeJS.Timeout

  /**
   * Constructs a Logger instance.
   *
   * @param filePath - Determines were the logs are stored in the filesystem.
   */
  public constructor(filePath: string) {
    this.#filePath = filePath
    this.#buffer = []
    this.#drainer = setInterval(() => {
      void this.flush()
    }, DRAIN_INTERVAL)

    console.log('Log file:', filePath)
  }

  /**
   * Flushes the current contents of the log buffer to the log file.
   */
  public async flush() {
    const logBlock = this.#buffer.join('')
    await appendFile(this.#filePath, logBlock)
    this.#buffer.splice(0)
  }

  /**
   * Flushes the logger and clears the log draining interval.
   */
  public async close() {
    clearInterval(this.#drainer)
    await this.flush()
  }

  /**
   * Debug logs a given log message.
   *
   * @param msg - The message to log.
   * @param others - Other (optional) messages.
   */
  public debug(msg: string, ...others: Array<string | number>) {
    this.log('debug', [msg, ...others])
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

    this.log('error', [entry])
  }

  /**
   * Traces function entry in a consistent way.
   *
   * @param targetName - Name of the object/class invoking the function being traced.
   * @param methodName - Name of the method/function being traced.
   * @param args - The arguments passed to the method/function.
   */
  public traceEnter(targetName: string, methodName: string, args: unknown[]) {
    const stringArgs = args.map(safeStringify).join(', ')

    this.debug(`--> ${targetName}::${methodName}(${stringArgs})`)
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
      const promiseIndex = curPromiseId++
      this.debug(`-?- ${targetName}::${methodName}(...): awaiting [Promise${promiseIndex}]`)

      result.then(
        (value: unknown) => {
          this.debug(
            `<-- ${targetName}::${methodName}(...): resolved [Promise${promiseIndex}]: ${safeStringify(
              value
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
      this.debug(`<-- ${targetName}::${methodName}(...): ${safeStringify(result)}`)
    }
  }

  /**
   * Logs a given message to the log file.
   *
   * @param level - 'debug' or 'error'.
   * @param msgs - Messages to log.
   */
  private log(level: Level, msgs: Array<string | number>) {
    const date = new Date().toISOString()

    this.#buffer.push(level + ' ' + process.pid + ' ' + date + ' ' + msgs.join(' ') + '\n')
  }
}
