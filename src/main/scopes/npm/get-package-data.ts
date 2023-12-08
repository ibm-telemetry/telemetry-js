/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type Logger } from '../../core/log/logger.js'
import { runCommand } from '../../core/run-command.js'
import { type PackageData } from './interfaces.js'

const cache = new Map<string, Promise<PackageData>>()

/**
 * Given a path to a package, get details about it, including name and version.
 *
 * @param packagePath - A directory to be treated as a package. It may or may not include a
 * package.json file directly in it. This is an absolute path.
 * @param logger - Logger instance.
 * @throws If no package details could be obtained or the directory didn't point to a valid package.
 * @returns An object containing details about the package.
 */
export async function getPackageData(packagePath: string, logger: Logger): Promise<PackageData> {
  logger.traceEnter('', 'getPackageData', [packagePath])

  if (cache.has(packagePath)) {
    const data = await (cache.get(packagePath) as Promise<PackageData>)
    logger.debug('getPackageData cache hit for ' + packagePath)
    logger.traceExit('', 'getPackageData', data)
    return data
  }

  const resultPromise = runCommand('npm pkg get name version', logger, {
    cwd: packagePath
  })

  const dataPromise = new Promise<PackageData>((resolve, reject) => {
    resultPromise
      .then((result) => {
        const [match] = /{[^{]*?}/.exec(result.stdout) ?? []
        if (match === undefined) {
          reject(new SyntaxError('Invalid JSON response from package get: ' + result.stdout))
          return
        }

        resolve(JSON.parse(match))
      })
      .catch((reason) => {
        reject(reason)
      })
  })

  cache.set(packagePath, dataPromise)

  logger.traceExit('', 'getPackageData', dataPromise)
  return await dataPromise
}
