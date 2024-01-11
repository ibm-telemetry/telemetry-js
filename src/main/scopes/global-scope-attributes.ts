/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const GlobalScopeAttributes = Object.freeze({
  //
  // Attributes relating to a metric's instrumented package
  //
  INSTRUMENTED_RAW: 'npm.dependency.instrumented.raw',
  INSTRUMENTED_OWNER: 'npm.dependency.instrumented.owner',
  INSTRUMENTED_NAME: 'npm.dependency.instrumented.name',
  INSTRUMENTED_VERSION_RAW: 'npm.dependency.instrumented.version.raw',
  INSTRUMENTED_VERSION_MAJOR: 'npm.dependency.instrumented.version.major',
  INSTRUMENTED_VERSION_MINOR: 'npm.dependency.instrumented.version.minor',
  INSTRUMENTED_VERSION_PATCH: 'npm.dependency.instrumented.version.patch',
  INSTRUMENTED_VERSION_PRE_RELEASE: 'npm.dependency.instrumented.version.preRelease'
})
