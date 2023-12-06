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

  //
  // Semantic version attributes
  //
  VERSION_RAW: 'npm.dependency.version.raw',
  VERSION_MAJOR: 'npm.dependency.version.major',
  VERSION_MINOR: 'npm.dependency.version.minor',
  VERSION_PATCH: 'npm.dependency.version.patch',
  VERSION_PRE_RELEASE: 'npm.dependency.version.preRelease',

  //
  // Attributes relating to a dependency's installer
  //
  INSTALLER_RAW: 'npm.dependency.installer.raw',
  INSTALLER_OWNER: 'npm.dependency.installer.owner',
  INSTALLER_NAME: 'npm.dependency.installer.name',
  INSTALLER_VERSION_RAW: 'npm.dependency.installer.version.raw',
  INSTALLER_VERSION_MAJOR: 'npm.dependency.installer.version.major',
  INSTALLER_VERSION_MINOR: 'npm.dependency.installer.version.minor',
  INSTALLER_VERSION_PATCH: 'npm.dependency.installer.version.patch',
  INSTALLER_VERSION_PRE_RELEASE: 'npm.dependency.installer.version.preRelease'
})
