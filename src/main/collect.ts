/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// This file is compiled as es6, which is different from the rest of the project (and older). This
// allows the file to be run in very old Node environments and perform pre-checks prior to running
// the mainline telemetry collection logic, which is compiled and bundled separately.
//

const MIN_NODE_VERSION = 16

// Check the node version and exit if it's too low
const major = parseInt(process.versions.node.split('.')[0] ?? '0')

if (major < MIN_NODE_VERSION) {
  console.log('Telemetry collection not supported in this environment. Skipping')
  // eslint-disable-next-line n/no-process-exit -- Avoid further code interpretation by exiting
  process.exit(0)
}

async function run() {
  const { notify } = await import('./notify.js')

  notify()

  const { spawnBackgroundProcess } = await import('./spawn-background-process.js')

  spawnBackgroundProcess()
}

run().catch((err) => {
  // As a failsafe, catch any uncaught exception, print it to stderr, and silently exit
  console.error(err)
})
