# Changelog

## [0.2.0](https://github.com/ibm-telemetrics/telemetrics-js/compare/v0.1.1...v0.2.0) (2023-09-21)


### Features

* add command line data gathering and basic usages ([51ee6ac](https://github.com/ibm-telemetrics/telemetrics-js/commit/51ee6acbbda87d67ff96b4066aa9a6e67560f6f1))
* add DependencyMetric and NpmScope ([#53](https://github.com/ibm-telemetrics/telemetrics-js/issues/53)) ([fb0dd74](https://github.com/ibm-telemetrics/telemetrics-js/commit/fb0dd740dc11a29fa2bb333738822f957e995f92))
* add transistor config schema file ([#18](https://github.com/ibm-telemetrics/telemetrics-js/issues/18)) ([75c20e4](https://github.com/ibm-telemetrics/telemetrics-js/commit/75c20e43f1fbe40017e2782386de3f07ace76e80))
* config file schema parsing & validation ([#54](https://github.com/ibm-telemetrics/telemetrics-js/issues/54)) ([a6d03bb](https://github.com/ibm-telemetrics/telemetrics-js/commit/a6d03bb9dc76270143af08f23882f09d1f64e8bf))
* **core:** add basic otel initialization logic ([#17](https://github.com/ibm-telemetrics/telemetrics-js/issues/17)) ([daa73fb](https://github.com/ibm-telemetrics/telemetrics-js/commit/daa73fba96498101645b1b89e1b23ef8463e9c12))
* **core:** add core framework for metric and scope definition ([9df4c7d](https://github.com/ibm-telemetrics/telemetrics-js/commit/9df4c7dad8ab45095677cfda83e12064b78a7667))
* **core:** implement data metric capturing in Scope class ([75d1460](https://github.com/ibm-telemetrics/telemetrics-js/commit/75d14600770a8df427cae9966611dbf73732bb6d))
* end-to-end run logic (feat/commander) ([#81](https://github.com/ibm-telemetrics/telemetrics-js/issues/81)) ([3042616](https://github.com/ibm-telemetrics/telemetrics-js/commit/304261648ac772bf255bcab1f3ad13923edc2c36))
* logging feature ([#44](https://github.com/ibm-telemetrics/telemetrics-js/issues/44)) ([49e8745](https://github.com/ibm-telemetrics/telemetrics-js/commit/49e8745f37508716994602b4476bed72061693c4))
* **otel:** switch to global registration of meter provider ([c4284ea](https://github.com/ibm-telemetrics/telemetrics-js/commit/c4284ea4734d76287f2b83ced05d033346360b03))
* switch to generic project name of "telemetrics" ([63a0991](https://github.com/ibm-telemetrics/telemetrics-js/commit/63a0991186865efe1d71c6f5587460637e1cdc44))


### Bug Fixes

* **deps:** remove @types/tmp in favor of tmp-promise ([8ee37c2](https://github.com/ibm-telemetrics/telemetrics-js/commit/8ee37c29c95b5864369a63aa91056c301053f69d))
* **deps:** update linter package major versions ([0d14985](https://github.com/ibm-telemetrics/telemetrics-js/commit/0d149851d5c79a5895a01ae3c9d2cadb60ac7d7b))
* **deps:** upgrade dependency prettier to ^3.0.3 ([#64](https://github.com/ibm-telemetrics/telemetrics-js/issues/64)) ([b9344c0](https://github.com/ibm-telemetrics/telemetrics-js/commit/b9344c0dab27a20caf4fc9d3797dbe8c6684056b))
* get package name and version ([fcc2a2e](https://github.com/ibm-telemetrics/telemetrics-js/commit/fcc2a2e1a2cf08aefba9fdf45ccca3ef7f96b82f))
* move origin tokenization to its own file ([#43](https://github.com/ibm-telemetrics/telemetrics-js/issues/43)) ([83ddce3](https://github.com/ibm-telemetrics/telemetrics-js/commit/83ddce3f50143f2a1e0af1ecbc39c2094df2a0f4))
* replace carbon-design-system org with ibm-telemetrics ([#86](https://github.com/ibm-telemetrics/telemetrics-js/issues/86)) ([84feaeb](https://github.com/ibm-telemetrics/telemetrics-js/commit/84feaeb13e02cf58a1f8f36e8b7a76c32034ff33))
* resolve eslint warnings on jsdocs ([acb2b7d](https://github.com/ibm-telemetrics/telemetrics-js/commit/acb2b7d873b0051509ef2f5e361863879aed8f32))
* switching to use spawn instead of exec ([71654c7](https://github.com/ibm-telemetrics/telemetrics-js/commit/71654c7e57314f73ad2a7337451bff9a8aabca1a))
* upgrade commitlint monorepo ([9d2b88c](https://github.com/ibm-telemetrics/telemetrics-js/commit/9d2b88c1edee8e928ffd6b12920fda1055642042))
* upgrade dependency eslint to ^8.46.0 ([#22](https://github.com/ibm-telemetrics/telemetrics-js/issues/22)) ([bba0e94](https://github.com/ibm-telemetrics/telemetrics-js/commit/bba0e94f15942cf267ffacb3ad9da864bb698484))
* upgrade dependency eslint-plugin-import to ^2.28.0 ([#14](https://github.com/ibm-telemetrics/telemetrics-js/issues/14)) ([9d695c3](https://github.com/ibm-telemetrics/telemetrics-js/commit/9d695c378e8ad23ee44b5faea8dd915ec2025f14))
* upgrade dependency eslint-plugin-import to ^2.28.1 ([#55](https://github.com/ibm-telemetrics/telemetrics-js/issues/55)) ([bdc55c0](https://github.com/ibm-telemetrics/telemetrics-js/commit/bdc55c0e87331d1e3a49d637df8fff423a53c8a4))
* upgrade dependency eslint-plugin-n to ^16.0.2 ([#56](https://github.com/ibm-telemetrics/telemetrics-js/issues/56)) ([cf6f87f](https://github.com/ibm-telemetrics/telemetrics-js/commit/cf6f87fa5f2c8a2cb7551e2e52670c1b07faa837))
* upgrade dependency lint-staged to v14 ([#62](https://github.com/ibm-telemetrics/telemetrics-js/issues/62)) ([289e03f](https://github.com/ibm-telemetrics/telemetrics-js/commit/289e03f55eb19febb7ee1fc0c648c6295b51c16c))
* upgrade dependency prettier to ^3.0.1 ([#21](https://github.com/ibm-telemetrics/telemetrics-js/issues/21)) ([7e61348](https://github.com/ibm-telemetrics/telemetrics-js/commit/7e6134807ad90187c16b62e4690579f27aeddc04))
* upgrade dependency prettier to ^3.0.2 ([#48](https://github.com/ibm-telemetrics/telemetrics-js/issues/48)) ([df2548d](https://github.com/ibm-telemetrics/telemetrics-js/commit/df2548d6122dae1d264d0844a39b8eaa14b2cebf))
* upgrade opentelemetry-js monorepo to ^1.15.2 ([#24](https://github.com/ibm-telemetrics/telemetrics-js/issues/24)) ([d2a16d6](https://github.com/ibm-telemetrics/telemetrics-js/commit/d2a16d68ffad0f85454c61de14620abd6b17faae))
* upgrade vitest monorepo to ^0.34.3 ([#49](https://github.com/ibm-telemetrics/telemetrics-js/issues/49)) ([b211f14](https://github.com/ibm-telemetrics/telemetrics-js/commit/b211f14bc4f73b3712b2eb972d6b1591d0e0938f))

## [0.1.1](https://github.com/carbon-design-system/telemetrics-js/compare/0.1.0...v0.1.1) (2023-07-28)


### Bug Fixes

* remove deps from allowable commit types ([fe1aea8](https://github.com/carbon-design-system/telemetrics-js/commit/fe1aea80d96f5f2dbf37e75ab56dfa2b8780fd5b))
