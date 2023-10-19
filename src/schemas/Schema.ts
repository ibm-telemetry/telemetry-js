/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Configuration outline for metrics collection using IBM telemetry.
 *
 * @title Telemetry Config Schema
 * @id https://[HOSTHERE]/schemas/telemetry-config.schema.json
 */
export interface Schema {
  /**
   * Current schema version.
   */
  version: 1
  /**
   * Unique identifier assigned on a per-project basis.
   */
  projectId: string
  /**
   * The keys under `collect` represent the various types of data that Telemetry is capable of
   * collecting (i.e. `scopes`).
   *
   * @minProperties 1
   */
  collect: {
    /**
     * Configuration for collecting telemetry data from an npm environment.
     *
     * @minProperties 1
     */
    npm?: {
      /**
       * Enable telemetry data collection for `dependencies`, `devDependencies`, and
       * `peerDependencies` that are siblings of the instrumented package.
       */
      dependencies?: null
    }
    /**
     * Configuration for collecting telemetry data from JSX files.
     *
     * @minProperties 1
     */
    jsx?: {
      /**
       * Enable telemetry data collection for JSX elements. The set of included elements is
       * determined by looking at import/require statements across analyzed source files.
       */
      elements?: {
        /**
         * Enable telemetry data collection for specific JSX attributes.
         * These are collected for all included JSX elements.
         * Specifying an `attributeName` here will turn on data collection for
         * boolean and numeric attribute values.
         * String value data collection is handled separately
         * via the `allowedAttributeStringValues` key.
         */
        allowedAttributeNames?: [string, ...string[]]
        /**
         * Enable telemetry data collection for specific string attribute values.
         * These are collected for all defined attributes in the `allowedAttributeNames` key.
         */
        allowedAttributeStringValues?: [string, ...string[]]
      }
    }
  }
}
