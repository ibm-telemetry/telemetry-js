/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      [
        'build', // Changes that affect how code is built (e.g. npm, tsconfig, Dockerfile, etc.)
        'ci', // Changes to CI config files and scripts (e.g. GH Workflows, SonarCloud, ESLint, etc.)
        'docs', // Documentation changes
        'feat', // A new feature (corresponds to a minor version). Use "feat!" for a breaking change
        'fix', // A fix for an issue (corresponds to a patch version)
        'refactor', // A rework of existing code that does not change its behaviors or externals
        'release', // reserved for automated release PRs only
        'revert', // A revert of a previous commit to cancel out its changes
        'test', // Changes/additions to tests
        'wip' // A work-in-progress commit, mostly for local use. Not intended for pushes to main
      ]
    ]
  }
}
