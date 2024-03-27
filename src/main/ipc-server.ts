/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as net from 'node:net'

const server = net.createServer({})

server.on('connection', (socket) => {
  let buf = ''
  socket.on('data', (data) => {
    buf += data.toString()
  })
  socket.on('close', () => {
    const obj = JSON.parse(buf)
    console.log('I received:')
    console.log(obj)
  })
})

process.on('SIGINT', () => server.close())
process.on('SIGTERM', () => server.close())

server.listen('com.ibm.telemetry.ipc', 3)
