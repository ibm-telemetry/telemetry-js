# WIP - Not finalized/approved

# IBM Telemetry JS

> JavaScript telemetry tooling for open/inner source projects

[![IBM Telemetry JS is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/ibm-telemetry/telemetry-js/blob/main/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/carbon-design-system/carbon/blob/master/CONTRIBUTING.md)

[![NPM version](https://img.shields.io/npm/v/%40ibm/telemetry-js.svg)](https://npmjs.org/package/@ibm/telemetry-js)
[![NPM downloads](https://img.shields.io/npm/dm/%40ibm/telemetry-js.svg)](https://npmjs.org/package/@ibm/telemetry-js)

[![Quality gate status](https://sonarcloud.io/api/project_badges/measure?project=ibm-telemetry_telemetry-js&metric=alert_status)](https://sonarcloud.io/dashboard?id=ibm-telemetry_telemetry-js)
[![Continuous integration checks status](https://github.com/ibm-telemetry/telemetry-js/actions/workflows/ci-checks.yml/badge.svg)](https://github.com/ibm-telemetry/telemetry-js/actions/workflows/ci-checks.yml)

## Quality metrics

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ibm-telemetry_telemetry-js&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=ibm-telemetry_telemetry-js)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=ibm-telemetry_telemetry-js&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=ibm-telemetry_telemetry-js)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=ibm-telemetry_telemetry-js&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=ibm-telemetry_telemetry-js)

[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ibm-telemetry_telemetry-js&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=ibm-telemetry_telemetry-js)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=ibm-telemetry_telemetry-js&metric=bugs)](https://sonarcloud.io/summary/new_code?id=ibm-telemetry_telemetry-js)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=ibm-telemetry_telemetry-js&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=ibm-telemetry_telemetry-js)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ibm-telemetry_telemetry-js&metric=coverage)](https://sonarcloud.io/summary/new_code?id=ibm-telemetry_telemetry-js)

## Overview

The purpose of this project is to provide standardized tooling to open source and inner source
maintainers that allows them to instrument their packages with telemetry tooling. This tooling
allows anonymized data to be captured on behalf of the instrumented package and reported back to a
central server for later analysis.

This project uses [OpenTelemetry](https://opentelemetry.io/) as the foundation of its data transport
format.

Find out more detailed documentation and guidelines by choosing from the following sections what
best describes your use case:

- [I use a package that is collecting data via IBM Telemetry](#ibm-telemetry-collection-basics)
- [I have a package that I want to onboard onto IBM Telemetry](#onboarding-a-package-onto-ibm-telemetry)
- [I don't work for IBM. Can I still use this?](#external-usage)

## IBM Telemetry collection basics

When a project installs a telemetry-enabled (instrumented) library, IBM telemetry performs
source-code analysis on consuming projects to identify package and component usage. This helps IBM
generate meaningful insights into exactly how much and in what ways reusable code is being consumed
across teams and projects.

### What data gets collected?

Depending on the nature of the instrumented package and its telemetry configuration, IBM Telemetry
may capture the following data:

- Date and time of collection
- Project name (as defined in package.json)
- Project version (as defined in package.json)
- Project repository
- Project dependencies
- Analyzed commit hash
- JSX elements (aka components) imported by the project from instrumented packages and the elements’
  attribute (aka prop) details: names, values, and importPaths

Element attribute names that haven't been **specifically configured** by the instrumented package to
be collected will be redacted before collection.

Boolean and number values will be captured by default for pre-configured attribute names. String
values that haven't been **specifically configured** by the instrumented package and other value
types are also redacted. This means project-specific data supplied to JSX elements will never be
captured.

All data that gets collected by the telemetry process gets anonymized previous to storage, see
[anonymization](#anonymization).

### When does data get collected?

Telemetry collection runs exclusively in CI environments. Collection will never happen on local
development environments or on projects that aren't configured to run automated scripts on a CI
environment (GitHub actions, Travis CI, etc.).

During a build or any other CI operation that installs package dependencies (`npm install`,
`yarn install`, ...), IBM telemetry will run as a silent process in the background and perform data
collection.

### Opt-out mechanism

IBM Telemetry will collect metric data for instrumented packages by default. If your project is
installing an IBM Telemetry-instrumented package and you wish to opt-out of metric collection, set
an environment variable of `IBM_TELEMETRY_DISABLED='true'`. This will prevent **any and all** data
from being collected in your project.

### Anonymization

All stored data is hashed using the SHA-256 cryptographic function, meaning an instrumented package
owner can query for specific known names/values but can never recover original values from the
stored data in the database.

## Onboarding a package onto IBM Telemetry

### Getting started

Start by determining what data (scopes) your package should collect. IBM Telemetry collection works
on a per-scope basis:

#### Npm scope

Captures data relating to the instrumented package's installer(s) and dependencies installed
alongside it. Specifically:

- Projects (name and version) that installed the instrumented package at the specified
  (instrumented) version.
- Projects (name and version) that are installed along with the instrumented package at the
  specified (instrumented) version.

This data can help answer questions such as:

- What projects are consuming my package?
- What is the distribution of different versions of my package that consumers are using?
- What percentage of consumers are using the latest version of my package?
- What version of React/Angular/Vue... are consumers most using along with my package?

#### JSX scope

Captures (JSX) element-specific usage data for the instrumented package. Specifically:

- All elements exported through the instrumented package that are being used in a given project that
  installed the package
- Element configurations (attributes and values), as determined by the `allowedAttributeNames` and
  `allowedAttributeStringValues` config options (see
  [Jsx Schema](https://github.com/ibm-telemetry/telemetry-config-schema/tree/main#jsx-schema))
- Import paths used to access the instrumented package's exported elements

This data can help you answer questions such as:

- What is the most widely used element exported through my package?
- What is the least widely used element exported through my package?
- What are the most commonly used attributes for a given element exported through my package?
- How many "button" elements imported from my package is "project x" using?

### Set up

1. Obtain a project Id

   TODO: how do people obtain a projectId?

1. Create a `telemetry.yml` config file.

   This file indicates what type of metrics will be captured for a given project and some other
   project-specific configurations.

   Sample:

   ```yaml path="sample-telemetry.yml"
   # yaml-language-server: $schema=https://unpkg.com/@ibm/telemetry-config-schema@0.2.0/dist/config.schema.json
   version: 1
   projectId: 'project id'
   endpoint: 'http://localhost:3000/v1/metrics'
   collect:
   npm:
     dependencies: null
   jsx:
     elements:
     allowedAttributeNames:
       - 'size'
       - 'title'
     allowedAttributeStringValues:
       - 'small'
       - 'medium'
       - 'large'
       - 'title1'
       - 'title2'
   ```

   Please see the
   [telemetry config schema](https://github.com/ibm-telemetry/telemetry-config-schema/tree/main#schema-keys)
   for a detailed explanation on all available configuration options.

   - Though this file can live anywhere within your project, it is customary to place it at the root
     level.

1. Add post-install script

   It is not necessary for your package to directly install telemetry as a dependency. Instead, use
   `npx` to call the published collection script directly from the `@ibm/telemetry-js` package.

   The post-install script runs telemetry collection after the instrumented package is installed in
   the target product:

   ```json path="package.json"
   ---,
   "scripts": {
   ---,
   "postinstall": "npx -y @ibm/telemetry-js --config=telemetry.yml",
   ---
   },
   ---
   ```

   Make sure the `--config=telemetry.yml` arg is congruent with the path to the `telemetry.yml`
   config file inside your project.

1. Add telemetry collection disclaimer to your docs

   You'll want to be as transparent as possible about telemetry collection and the data that is
   being stored. As an optional step, consider adding an informational paragraph to your docs
   -usually the README- along the lines of:

   [TODO: badge or SVG graphic]

   "This package uses IBM Telemetry to collect metric data. By installing this package as a
   dependency you are agreeing to telemetry collection. For more information on the data being
   collected and opt-out mechanisms please see
   [IBM Telemetry](https://github.com/ibm-telemetry/telemetry-js/tree/main#ibm-telemetry-collection-basics)."

1. Publish a new version of your package

   Package consumers need to install a version of your package that includes both the config file
   and post-install script in order for telemetry collection to occur.

1. Done!

   Whenever consumers pick up a version of your package that includes the config file and
   post-install script, telemetry collection will run and collect metrics.

## External usage <!-- TODO: remove? -->

IBM Telemetry is an open-source project available to everyone, everywhere, regardless of whether or
no they work for IBM.

All documentation available here (see
[Onboarding a package onto IBM Telemetry](#onboarding-a-package-onto-ibm-telemetry)) applies all the
same to internal/open-source packages with one caveat: metric storage.

### Metric storage

Given that your package is not IBM-owned, you'll want to host and manipulate your own metric data
however you see fit. IBM **will not store or manipulate metric data on behalf of your package if the
package is not IBM owned**.

For this purpose, you'll want to provide your custom `endpoint` url in the `telemetry.yml` config
file (see [Set up](#set-up)) that IBM telemetry can send fully fleshed-out metrics to for storage
and further manipulation.

The requests that IBM telemetry will make onto your supplied endpoint will comply with the following
format:

TODOASKJOE

## Accessing metrics

Coming soon!
