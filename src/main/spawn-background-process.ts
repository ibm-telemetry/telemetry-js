/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
async function spawnBackgroundProcess() {
  const childProcess = await import('node:child_process')
  const path = await import('node:path')
  const { fileURLToPath } = await import('node:url')

  const { createLogFilePath } = await import('./core/log/create-log-file-path.js')

  const date = new Date().toISOString()
  const logFilePath = createLogFilePath(date)

  console.log('Log file:', logFilePath)

  childProcess
    .spawn(
      process.argv0,
      [
        path.join(path.dirname(fileURLToPath(import.meta.url)), 'background-process.js'),
        `--log=${logFilePath}`,
        ...process.argv.slice(2)
      ],
      {
        stdio: 'ignore',
        detached: true,
        shell: true
      }
    )
    .unref()
}

export { spawnBackgroundProcess }
