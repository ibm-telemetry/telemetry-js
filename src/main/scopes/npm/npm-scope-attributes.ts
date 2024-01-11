/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const NpmScopeAttributes = Object.freeze({
  //
  // General dependency name attributes
  //
  RAW: 'npm.dependency.raw',
  OWNER: 'npm.dependency.owner',
  NAME: 'npm.dependency.name',
  IS_INSTRUMENTED: 'npm.dependency.isInstrumented',

  //
  // Semantic version attributes
  //
  VERSION_RAW: 'npm.dependency.version.raw',
  VERSION_MAJOR: 'npm.dependency.version.major',
  VERSION_MINOR: 'npm.dependency.version.minor',
  VERSION_PATCH: 'npm.dependency.version.patch',
  VERSION_PRE_RELEASE: 'npm.dependency.version.preRelease'
})
