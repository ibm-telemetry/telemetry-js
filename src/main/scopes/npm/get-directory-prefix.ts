/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from '../../core/log/logger.js'
import { runCommand } from '../../core/run-command.js'

const cache = new Map<string, string>()

/**
 * Given a directory path, get the directory of the package it belongs to.
 *
 * @param dirPath - A directory to find containing package for. It may or may not include a
 * package.json file directly in it. This is an absolute path.
 * @param logger - Logger instance.
 * @returns A string indicating the closest (ascendent) package directory.
 */
export async function getDirectoryPrefix(dirPath: string, logger: Logger): Promise<string> {
  logger.traceEnter('', 'getDirectoryPrefix', [dirPath])

  if (cache.has(dirPath)) {
    const data = cache.get(dirPath) as string
    logger.debug('getDirectoryPrefix cache hit for ' + dirPath)
    logger.traceExit('', 'getDirectoryPrefix', data)
    return data
  }

  // ignoring workspaces for this command because otherwise it would always
  // return the root for workspaced packages, this is irrelevant for non-workspace repositories
  const result = await runCommand('npm prefix --no-workspaces', logger, {
    cwd: dirPath
  })

  cache.set(dirPath, result.stdout)

  logger.traceExit('', 'getDirectoryPrefix', result.stdout)
  return result.stdout
}
