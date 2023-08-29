/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { appendFile } from 'fs/promises'

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
   * Logs a given message to the log file.
   *
   * @param level - 'debug' or 'error'.
   * @param msg - Message to log, can be a string or instance of Error class.
   */
  public async log(level: Level, msg: string | Error) {
    if (msg instanceof Error) {
      msg = msg.stack ?? msg.name + ' ' + msg.message
    }
    await appendFile(this.filePath, `${level} ${new Date().toISOString()} ${msg}\n`)
  }
}
