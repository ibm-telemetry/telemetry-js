/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Parses git remote information and returns raw and tokenized fields for it.
 *
 * @param repositoryUrl - The URL to parse.
 * @returns A tokenized representation of the URL.
 */
function tokenizeRepository(repositoryUrl: string) {
  let parsed: {
    host: string | undefined
    owner: string | undefined
    repository: string | undefined
  } = {
    host: undefined,
    owner: undefined,
    repository: undefined
  }

  if (repositoryUrl.startsWith('http')) {
    parsed = parseHttp(repositoryUrl)
  } else if (repositoryUrl.startsWith('git@')) {
    parsed = parseSsh(repositoryUrl)
  }

  if (parsed.repository?.endsWith('.git') === true) {
    parsed.repository = parsed.repository.slice(0, -4)
  }

  return parsed
}

/**
 * Parses a git remote URL as HTTP.
 * Example: "https://github.com/ibm-telemetry/telemetry-js.git".
 *
 * @param raw - URL to parse.
 * @returns Object containing a tokenized git remote.
 */
function parseHttp(raw: string) {
  const match = /^https?:\/\/([^/]+)\/([^/]+)\/([^/]+)/.exec(raw) ?? []
  const [_raw, host, owner, repository] = match

  return {
    host,
    owner,
    repository
  }
}

/**
 * Parses a git remote URL as SSH.
 * Example: "git@github.com:ibm-telemetry/telemetry-js.git".
 *
 * @param raw - URL to parse.
 * @returns Object containing a tokenized git remote.
 */
function parseSsh(raw: string) {
  const match = /^([^@]+)@([^:]+):([^/]+)\/([^/]+)/.exec(raw) ?? []
  const [_raw, _user, host, owner, repository] = match

  return {
    host,
    owner,
    repository
  }
}

export { tokenizeRepository }
