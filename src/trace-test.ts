/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createLogFilePath, Logger } from './main/core/logger.js'
import { Trace } from './main/core/utils/trace.js'

const date = new Date().toISOString()
const logFilePath = await createLogFilePath(date)

/**
 * Throwaway.
 */
export class MyTestClass {
  readonly logger: Logger
  constructor() {
    this.logger = new Logger(logFilePath)
  }

  @Trace()
  MyTraceableMethod() {
    console.log('this method does stuff that gets printed on: ', logFilePath)
    return 'this is my return value'
  }
}

const testClass = new MyTestClass()
testClass.MyTraceableMethod()
