/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { appendFile } from 'fs/promises'
import { tmpName } from 'tmp-promise'

type Level = 'debug' | 'error'

class Logger {
  private readonly filePath: string

  public constructor(filePath: string) {
    this.filePath = filePath
  }

  public async log(level: Level, msg: string | Error) {
    if (msg instanceof Error) {
      msg = msg.stack ?? msg.name + ' ' + msg.message
    }
    await appendFile(this.filePath, `${level} ${new Date().toISOString()} ${msg}\n`)
  }
}

/**
 * TODO.
 *
 * @param date - TODO.
 * @returns TODO.
 */
async function createLogFilePath(date: string) {
  return await tmpName({
    template: `ibmtelemetrics-${date.replace(/[:.-]/g, '')}-XXXXXX.log`
  })
}

export { createLogFilePath, Logger }
