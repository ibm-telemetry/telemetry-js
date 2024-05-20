/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict'
import chalk from 'chalk'

console.warn(
  '----------------------------------------------------------------------------' +
    '-----------------------------------------------------------------------\n' +
    chalk.yellow('NOTICE: ') +
    'A package you installed is using IBM Telemetry to collect anonymous usage data. ' +
    "This information is used to influence the project's roadmap and prioritize bug fixes." +
    ' \n\nYou can opt-out of this process by setting ' +
    chalk.dim.gray("IBM_TELEMETRY_DISABLED='true'") +
    ' in your environment.' +
    '\n\nTo learn more, please visit: ' +
    chalk.blue.underline.italic('https://github.com/ibm-telemetry/telemetry-js') +
    '.\n' +
    '-----------------------------------------------------------------------------' +
    '----------------------------------------------------------------------\n'
)
