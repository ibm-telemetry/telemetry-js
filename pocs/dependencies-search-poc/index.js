/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

import lodash from 'lodash'
import objectScan from 'object-scan'

import { exec } from './exec.js'

const fileExists = async (path) => Boolean(await fs.stat(path).catch(() => false))

const parsePkgJSONContents = (json, pkgName, pkgVersion) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- blah
  const matches = objectScan([`dependencies.**.${pkgName}`], {
    filterFn: ({ value }) => value.version === pkgVersion
  })(json)

  return matches.map((match) => {
    // we want to ignore last 2 because: [... parentPkgName ,dependencies, pkgName]
    const parentPkgPath = match.slice(0, -2)
    const parentPkg = parentPkgPath.length === 0 ? json : lodash.get(json, parentPkgPath)
    return {
      name: parentPkgPath.length === 0 ? json.name : match[parentPkgPath.length - 1],
      version: parentPkg.version,
      dependencies: Object.entries(parentPkg.dependencies).map(([key, value]) => {
        return {
          name: key,
          version: value.version
        }
      })
    }
  })
}

const findPkgInProject = async (pkgName, pkgVersion) => {
  const installingPackages = []
  // Assume we are in a sub-folder of a node_modules folder. Step out of it
  let prevCurrentPath = null
  let currentPath = path.join(process.cwd(), '..', '..')

  // what happens if we run out of paths? would that even happen?
  while (installingPackages.length === 0 && currentPath !== prevCurrentPath) {
    const pkgJsonPath = path.join(currentPath, '/package.json')
    if (await fileExists(pkgJsonPath)) {
      const pkgJSONContents = JSON.parse(exec('npm ls --all --json', { cwd: currentPath }))
      installingPackages.push(...parsePkgJSONContents(pkgJSONContents, pkgName, pkgVersion))
    }
    prevCurrentPath = currentPath
    currentPath = path.join(currentPath, '..')
  }
  return installingPackages
}

const getCurrentPkgDetails = () => {
  const { name, version } = JSON.parse(exec('npm pkg get name version'))

  return [name, version]
}

// me running everything we need to get the relevant data
const [name, version] = getCurrentPkgDetails()
const data = { name, version, installingPackages: await findPkgInProject(name, version) }
// eslint-disable-next-line vitest/require-hook -- blah
console.log(JSON.stringify(data, null, 2))
