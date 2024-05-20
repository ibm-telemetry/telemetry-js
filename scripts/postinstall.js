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
    'A package you installed uses IBM Telemetry to collect metrics data. ' +
    'By installing this package as a dependency you are agreeing to telemetry collection.\n\nTo opt out, see ' +
    chalk.blue.underline.italic(
      'https://github.com/ibm-telemetry/telemetry-js/tree/main#opting-out-of-ibm-telemetry-data-collection'
    ) +
    '.\n\nFor more information on the data being collected, please refer to the IBM Telemetry documentation at ' +
    chalk.blue.underline.italic(
      'https://github.com/ibm-telemetry/telemetry-js/tree/main#ibm-telemetry-collection-basics.\n'
    ) +
    '-----------------------------------------------------------------------------' +
    '----------------------------------------------------------------------\n'
)
