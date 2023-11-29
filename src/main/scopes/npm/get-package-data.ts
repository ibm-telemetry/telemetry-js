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
 * @param isWorkSpace - For internal use only, indicates that the queried package is a workspace, 
 * this affects the command run to get the package's info.
 * @throws If no package details could be obtained or the directory didn't point to a valid package.
 * @returns An object containing details about the package.
 */
export async function getPackageData(
  packagePath: string,
  logger: Logger,
  isWorkSpace = false
): Promise<PackageData> {
  logger.traceEnter('', 'getPackageData', [packagePath])

  if (cache.has(packagePath) && !isWorkSpace) {
    const data = await (cache.get(packagePath) as Promise<PackageData>)
    logger.debug('getPackageData cache hit for ' + packagePath)
    logger.traceExit('', 'getPackageData', data)
    return data
  }
  const command = isWorkSpace ? 'npm pkg get name version --ws' : 'npm pkg get name version'

  const resultPromise = runCommand(command, logger, {
    cwd: packagePath
  })

  const dataPromise = new Promise<PackageData>(async (resolve, reject) => {
    try {
      const result = await resultPromise
      const data = JSON.parse(result.stdout)
      logger.traceExit('', 'getPackageData', data)
      resolve(data)
    } catch(reason) {
      if (!isWorkSpace) {
        // TODO: is there a better way to do this other than trial and error
        // is there a way for us to know the package belongs to a workspace 
        // before attempting to get it's info?
        await getPackageData(packagePath, logger, true)
          .then((res) => {
            resolve(Object.values(res)[0])
          })
          .catch((err) => {
            reject(err)
          })
      } else {
        reject(reason)
      }
    }
  })

  cache.set(packagePath, dataPromise)

  return await dataPromise
}
