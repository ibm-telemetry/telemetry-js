/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import tmp from 'tmp'
import { createLogger, format, type Logger as WinstonLogger, transports } from 'winston'

class Logger {
  private static instance?: Logger
  private readonly logger: WinstonLogger

  constructor(tempFilePath: string) {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.simple()),
      defaultMeta: { service: 'logger-service' },
      transports: [new transports.File({ filename: tempFilePath })]
    })
  }

  /**
   * Obtain a singleton instance of a Logger used to send messages.
   *
   * @returns The singleton.
   */
  public static async getInstance(): Promise<Logger> {
    if (Logger.instance == null) {
      const tempFile = await new Promise(function (resolve, reject) {
        tmp.file(
          { prefix: 'ibm-telemetry-', postfix: '.txt', discardDescriptor: true },
          (err: Error | null, path: string) => {
            if (err != null) reject(err)
            console.log('File: ', path, typeof path)
            resolve(path)
          }
        )
      })
      Logger.instance = new Logger(tempFile as string)
    }

    return Logger.instance
  }

  public error(msg: string) {
    this.logger.log('error', msg)
  }

  public debug(msg: string) {
    this.logger.log('debug', msg)
  }
}

;(await Logger.getInstance()).debug('heyyy')
