/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
async function spawnBackgroundProcess() {
  const childProcess = await import('child_process')
  const path = await import('path')
  const { dirname } = path
  const { fileURLToPath } = await import('url')

  const { createLogFilePath } = await import('./core/log/create-log-file-path.js')

  const date = new Date().toISOString()
  const logFilePath = createLogFilePath(date)

  console.log('Log file:', logFilePath)

  childProcess
    .spawn(
      process.argv0,
      [
        path.join(dirname(fileURLToPath(import.meta.url)), 'background-process.js'),
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
