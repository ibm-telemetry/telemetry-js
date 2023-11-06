/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const CustomResourceAttributes = Object.freeze({
  //
  // General attributes
  //
  PROJECT_ID: 'project.id',
  DATE: 'date',

  //
  // Attributes relating to details about the currently-running emitter
  //
  TELEMETRY_EMITTER_NAME: 'telemetry.emitter.name',
  TELEMETRY_EMITTER_VERSION: 'telemetry.emitter.version',

  //
  // Attributes relating to details about the analyzed repository
  //
  ANALYZED_RAW: 'analyzed.raw',
  ANALYZED_HOST: 'analyzed.host',
  ANALYZED_OWNER: 'analyzed.owner',
  ANALYZED_REPOSITORY: 'analyzed.repository',
  ANALYZED_COMMIT: 'analyzed.commit',

  //
  // Semantic version attributes
  //
  VERSION_RAW: 'version.raw',
  VERSION_MAJOR: 'version.major',
  VERSION_MINOR: 'version.minor',
  VERSION_PATCH: 'version.patch',
  VERSION_PRE_RELEASE: 'version.preRelease',

  //
  // Attributes relating to a dependency
  //
  RAW: 'raw',
  OWNER: 'owner',
  NAME: 'name',

  //
  // Attributes relating to a dependency's installer
  //
  INSTALLER_RAW: 'installer.raw',
  INSTALLER_OWNER: 'installer.owner',
  INSTALLER_NAME: 'installer.name',
  INSTALLER_VERSION_RAW: 'installer.version.raw',
  INSTALLER_VERSION_MAJOR: 'installer.version.major',
  INSTALLER_VERSION_MINOR: 'installer.version.minor',
  INSTALLER_VERSION_PATCH: 'installer.version.patch',
  INSTALLER_VERSION_PRE_RELEASE: 'installer.version.preRelease'
})
