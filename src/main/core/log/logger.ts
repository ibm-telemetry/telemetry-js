/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { appendFile } from 'node:fs/promises'

type Level = 'debug' | 'error'

/**
 * Logger class to log debug and error statements to a given file.
 */
export class Logger {
  private readonly filePath: string

  /**
   * Constructs a Logger instance.
   *
   * @param filePath - Determines were the logs are stored in the filesystem.
   */
  public constructor(filePath: string) {
    this.filePath = filePath
  }

  /**
   * Debug logs a given log message.
   *
   * @param msg - The message to log.
   */
  public async debug(msg: string) {
    await this.log('debug', msg)
  }

  /**
   * Error logs a given message/error.
   *
   * @param msg - The message/error to log.
   */
  public async error(msg: string | Error) {
    if (msg instanceof Error) {
      msg = msg.stack ?? msg.name + ' ' + msg.message
    }

    await this.log('error', msg)
  }

  /**
   * Logs a given message to the log file.
   *
   * @param level - 'debug' or 'error'.
   * @param msg - Message to log.
   */
  private async log(level: Level, msg: string) {
    const date = new Date().toISOString()

    if (process.env['NODE_ENV'] !== 'production') {
      switch (level) {
        case 'debug':
          console.debug(level, date, msg)
          break
        case 'error':
          console.error(level, date, msg)
      }
    }

    await appendFile(this.filePath, level + ' ' + date + ' ' + msg + '\n')
  }
}
