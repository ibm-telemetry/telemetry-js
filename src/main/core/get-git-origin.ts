/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { exec } from './exec.js'

function getGitOrigin() {
  let parsed: {
    host: string | undefined
    owner: string | undefined
    repository: string | undefined
  } = {
    host: undefined,
    owner: undefined,
    repository: undefined
  }

  // TODO: handle non-existant remote
  const raw = exec('git remote get-url origin')

  if (raw.startsWith('http')) {
    // Example: https://github.com/carbon-design-system/telemetrics-js.git
    parsed = parseHttp(raw)
  } else if (raw.startsWith('git@')) {
    // Example: git@github.com:carbon-design-system/telemetrics-js.git
    parsed = parseSsh(raw)
  }

  if (parsed.repository?.endsWith('.git') === true) {
    parsed.repository = parsed.repository.slice(0, -4)
  }

  return {
    raw,
    ...parsed
  }
}

function parseHttp(raw: string) {
  const match = /^https?:\/\/((.*?)\/)?((.*?)\/)?(.*)/.exec(raw) ?? []

  const [_raw, _hostGroup, host, _ownerGroup, owner, repository] = match

  return {
    host,
    owner,
    repository
  }
}

function parseSsh(raw: string) {
  const match = /^(.*?)@(.*?):((.*?)\/)?(.*)/.exec(raw) ?? []

  const [_raw, _user, host, _ownerGroup, owner, repository] = match

  return {
    host,
    owner,
    repository
  }
}

export { getGitOrigin }
