/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as net from 'node:net'

const socket = net.connect('com.ibm.telemetry.ipc')

socket.write(
  Buffer.from(JSON.stringify({ cwd: process.cwd(), configPath: './some/cool/path/telemetry.yml' }))
)
socket.end()
