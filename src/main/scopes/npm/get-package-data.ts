/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DirectoryEnumerator } from '../../core/directory-enumerator.js'
import { type Logger } from '../../core/log/logger.js'
import { runCommand } from '../../core/run-command.js'
import { NoPackageDataFoundError } from '../../exceptions/no-package-data-found-error.js'
import { type PackageData } from './interfaces.js'

const cache = new Map<string, Promise<PackageData>>()

/**
 * Given a path to a package, get details about it, including name and version.
 *
 * @param packagePath - A directory to be treated as a package. It may or may not include a
 * package.json file directly in it. This is an absolute path.
 * @param root - Root-most directory to consider.
 * @param logger - Logger instance.
 * @throws If no package details could be obtained or the directory didn't point to a valid package.
 * This function will also throw if the package does not have either the name or version field
 * present.
 * @returns An object containing details about the package.
 */
export async function getPackageData(
  packagePath: string,
  root: string,
  logger: Logger
): Promise<PackageData> {
  logger.traceEnter('', 'getPackageData', [packagePath])

  const dirs = await new DirectoryEnumerator(logger).find(packagePath, root, () => true)
  let packageData: PackageData | undefined

  for (const dir of dirs) {
    try {
      packageData = await getImmediatePackageData(dir, logger)
    } catch (err) {
      logger.debug(String(err))
    }
    if (packageData?.name !== undefined && packageData?.version !== undefined) {
      break
    }
  }

  if (packageData === undefined) {
    throw new NoPackageDataFoundError(packagePath)
  }

  logger.traceExit('', 'getPackageData', packageData)
  return packageData
}

async function getImmediatePackageData(dir: string, logger: Logger): Promise<PackageData> {
  if (cache.has(dir)) {
    logger.debug('getImmediatePackageData cache hit for ' + dir)
    return await (cache.get(dir) as Promise<PackageData>)
  }

  const resultPromise = runCommand('npm pkg get name version', logger, {
    cwd: dir
  })

  const getData = async () => {
    const result = await resultPromise

    const [match] = /{[^{]*?}/.exec(result.stdout) ?? []
    if (match === undefined) {
      throw new SyntaxError('Invalid JSON response from package get: ' + result.stdout)
    }

    return JSON.parse(match)
  }

  cache.set(dir, getData())
  return await (cache.get(dir) as Promise<PackageData>)
}
