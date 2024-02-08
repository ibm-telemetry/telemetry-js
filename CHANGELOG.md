# Changelog

## [1.2.1](https://github.com/ibm-telemetry/telemetry-js/compare/v1.2.0...v1.2.1) (2024-02-08)


### Bug Fixes

* add clarity and transparency to the readme ([#188](https://github.com/ibm-telemetry/telemetry-js/issues/188)) ([20db3d6](https://github.com/ibm-telemetry/telemetry-js/commit/20db3d62edff3572fc84e6eb3382bc6b0192b492))
* minor enhancements ([#178](https://github.com/ibm-telemetry/telemetry-js/issues/178)) ([3fec8cc](https://github.com/ibm-telemetry/telemetry-js/commit/3fec8cc7bc8f27220e6eeff4265354f671d751f4))

## [1.2.0](https://github.com/ibm-telemetry/telemetry-js/compare/v1.1.0...v1.2.0) (2024-01-24)


### Features

* add combined repository key to metrics ([#170](https://github.com/ibm-telemetry/telemetry-js/issues/170)) ([ffc53af](https://github.com/ibm-telemetry/telemetry-js/commit/ffc53af388802d42348e56ac3ce6e94243201ec8))
* add new keys to element and dependency metrics ([#169](https://github.com/ibm-telemetry/telemetry-js/issues/169)) ([10ddf21](https://github.com/ibm-telemetry/telemetry-js/commit/10ddf2167e115b2a0a968df18f401349a7dfa0e1))
* JsxScope - Capture metrics only for files contained within local package ([#146](https://github.com/ibm-telemetry/telemetry-js/issues/146)) ([c4da537](https://github.com/ibm-telemetry/telemetry-js/commit/c4da537746a2b3b7bd53a50b96e6f559c4e17366))


### Bug Fixes

* **deps:** upgrade dependency vite to v5.0.12 [SECURITY] ([#172](https://github.com/ibm-telemetry/telemetry-js/issues/172)) ([c2d7a62](https://github.com/ibm-telemetry/telemetry-js/commit/c2d7a62c12aa7a8b240e43b9aa61145c27a31325))
* **deps:** upgrade devDependencies (minor) ([#159](https://github.com/ibm-telemetry/telemetry-js/issues/159)) ([1d4bc52](https://github.com/ibm-telemetry/telemetry-js/commit/1d4bc52968864cc5138a2a229be4dd81729eec27))
* **deps:** upgrade devDependencies (minor) ([#168](https://github.com/ibm-telemetry/telemetry-js/issues/168)) ([348fee2](https://github.com/ibm-telemetry/telemetry-js/commit/348fee2ae5fee5547ffab285483d8213195aa8a7))
* refactor some git-related commands ([4ef95b3](https://github.com/ibm-telemetry/telemetry-js/commit/4ef95b3e745d0b00a8e237d9211982bfd4d85428))
* update copyrights to 2024 ([#176](https://github.com/ibm-telemetry/telemetry-js/issues/176)) ([7632e30](https://github.com/ibm-telemetry/telemetry-js/commit/7632e30b56da7760742207cf874ac8d25878266a))

## [1.1.0](https://github.com/ibm-telemetry/telemetry-js/compare/v1.0.0...v1.1.0) (2023-12-18)


### Features

* **npm:** add support for querying instrumented pkg dependency metrics ([037e846](https://github.com/ibm-telemetry/telemetry-js/commit/037e8464ce05da91257e930e485a0f857354d443))
* run telemetry collection as a background process ([#147](https://github.com/ibm-telemetry/telemetry-js/issues/147)) ([273a466](https://github.com/ibm-telemetry/telemetry-js/commit/273a466d27631bbd55002e2ef3d919cd9ef73344))


### Bug Fixes

* **jsx:** remove trace from captureFileMetrics ([fec2265](https://github.com/ibm-telemetry/telemetry-js/commit/fec2265c1a7f5072ae3307a3372e62e6fed6039e))

## [1.0.0](https://github.com/ibm-telemetry/telemetry-js/compare/v0.8.1...v1.0.0) (2023-12-14)


### ⚠ BREAKING CHANGES

* promote to v1

### Features

* implement commit hash collection ([#156](https://github.com/ibm-telemetry/telemetry-js/issues/156)) ([48b4fc7](https://github.com/ibm-telemetry/telemetry-js/commit/48b4fc733b73dd50fe0feaa59bd0a0a7ff9f3d71))
* promote to v1 ([6e870c4](https://github.com/ibm-telemetry/telemetry-js/commit/6e870c4a949b4e121b27a3ec2f12e82ed55a00c1))


### Bug Fixes

* **deps:** upgrade devDependencies (minor) ([#141](https://github.com/ibm-telemetry/telemetry-js/issues/141)) ([bbf3c4a](https://github.com/ibm-telemetry/telemetry-js/commit/bbf3c4a1107503a3ff28c5ea805adcda0342fa3d))
* **dev-deps:** update vite to latest ([222423b](https://github.com/ibm-telemetry/telemetry-js/commit/222423b9d4171f41fbcc2fa7cf56ed9dc216ed7b))

## [0.8.1](https://github.com/ibm-telemetry/telemetry-js/compare/v0.8.0...v0.8.1) (2023-12-08)


### Bug Fixes

* remove WIP heading from readme ([7503381](https://github.com/ibm-telemetry/telemetry-js/commit/7503381f7fcc16828c4c600ca0d2cfecf54b03e1))

## [0.8.0](https://github.com/ibm-telemetry/telemetry-js/compare/v0.7.0...v0.8.0) (2023-12-08)


### Features

* add ci awareness ([994431c](https://github.com/ibm-telemetry/telemetry-js/commit/994431c89ae54707662477a88d1a27689c8b4ea8))
* adjust metric names for consistency ([2c31748](https://github.com/ibm-telemetry/telemetry-js/commit/2c31748b0fffe854bfd58556ee659217dbe84f63))
* **core:** remove nullish values from captured metrics ([738e035](https://github.com/ibm-telemetry/telemetry-js/commit/738e0351865a9ac6637d38ba11fc4fc6ec19cc86))
* fully qualify scope metric attribute names ([1891a35](https://github.com/ibm-telemetry/telemetry-js/commit/1891a354b507a41411410fea04939523e0d86fbd))


### Bug Fixes

* add tracing to JsxScope#processFile ([2c8d326](https://github.com/ibm-telemetry/telemetry-js/commit/2c8d3262979ee83438a34438c793c7bd11d44f3f))
* **core:** use Object.fromEntries instead of map/reduce ([71e245a](https://github.com/ibm-telemetry/telemetry-js/commit/71e245a9178d0aa5641963a852623e3b08b0f940))
* get-package-data regular expression workspace bug ([c52ad7c](https://github.com/ibm-telemetry/telemetry-js/commit/c52ad7ce77488f6dab64f68b484970ff638e7493)), closes [#107](https://github.com/ibm-telemetry/telemetry-js/issues/107)
* improve promise tracking in debug logging ([cc14bc2](https://github.com/ibm-telemetry/telemetry-js/commit/cc14bc202a85e59a4878930f3c782e0cd1fa900e))
* run jsxScope e2e run one file at a time in tests ([#145](https://github.com/ibm-telemetry/telemetry-js/issues/145)) ([c7ea7b6](https://github.com/ibm-telemetry/telemetry-js/commit/c7ea7b6f4bd903eab7bf8ddb38da8c2b50026df2))

## [0.7.0](https://github.com/ibm-telemetry/telemetry-js/compare/v0.6.2...v0.7.0) (2023-11-18)


### Features

* **core:** move to schema version 0.3.0 ([4efd234](https://github.com/ibm-telemetry/telemetry-js/commit/4efd2348ab1c52e04fccaa77537aa8634185cd18))

## [0.6.2](https://github.com/ibm-telemetry/telemetry-js/compare/v0.6.1...v0.6.2) (2023-11-17)


### Bug Fixes

* improve logging ([1f860a4](https://github.com/ibm-telemetry/telemetry-js/commit/1f860a4bf979435eca3372bdddd3e2e73bbfcf10))

## [0.6.1](https://github.com/ibm-telemetry/telemetry-js/compare/v0.6.0...v0.6.1) (2023-11-17)


### Bug Fixes

* **core:** improve substitute and safeStringify stability ([a859944](https://github.com/ibm-telemetry/telemetry-js/commit/a859944f7924d3232e286641759f7baaf41998cd))
* **npm:** improve performance of getPackageData ([8c43570](https://github.com/ibm-telemetry/telemetry-js/commit/8c43570b3d4745025971041506eb5c858be5f7be))

## [0.6.0](https://github.com/ibm-telemetry/telemetry-js/compare/v0.5.3...v0.6.0) (2023-11-17)


### Features

* **jsx:** remove raw attr from jsx elements ([0e5db9d](https://github.com/ibm-telemetry/telemetry-js/commit/0e5db9d218480987b269d60a35aabd2a00bb00a2))


### Bug Fixes

* **npm:** add caching to get-package-data ([692ac0a](https://github.com/ibm-telemetry/telemetry-js/commit/692ac0aaba3c0aaa8bb24f5212f68c849ed86e90))

## [0.5.3](https://github.com/ibm-telemetry/telemetry-js/compare/v0.5.2...v0.5.3) (2023-11-17)


### Bug Fixes

* **tracked-file-enumerator:** improve robustness and error handling ([e2a38ac](https://github.com/ibm-telemetry/telemetry-js/commit/e2a38ac6e332150db1de443e713cc9fd6b951c01))

## [0.5.2](https://github.com/ibm-telemetry/telemetry-js/compare/v0.5.1...v0.5.2) (2023-11-17)


### Bug Fixes

* resolution of overlapping root and tracked file paths ([8d7a282](https://github.com/ibm-telemetry/telemetry-js/commit/8d7a2829dd18c4fe26919d981a15d1bbcb6f8082))

## [0.5.1](https://github.com/ibm-telemetry/telemetry-js/compare/v0.5.0...v0.5.1) (2023-11-17)


### Bug Fixes

* **deps:** upgrade devDependencies (minor) ([#128](https://github.com/ibm-telemetry/telemetry-js/issues/128)) ([4c46ae0](https://github.com/ibm-telemetry/telemetry-js/commit/4c46ae0cc58a6c457da2b6a3dbadee04fd5b4024))
* relativize tracked file path before resolving it ([4be0b35](https://github.com/ibm-telemetry/telemetry-js/commit/4be0b35a454818eae0cda29a1a0037d895aa6675))

## [0.5.0](https://github.com/ibm-telemetry/telemetry-js/compare/v0.4.0...v0.5.0) (2023-11-17)


### Features

* switch everything to absolute pathing ([a57263c](https://github.com/ibm-telemetry/telemetry-js/commit/a57263ca64a2d69af3bd45ccb025317e11c14518))

## [0.4.0](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.8...v0.4.0) (2023-11-15)


### Features

* jsx scope ([#87](https://github.com/ibm-telemetry/telemetry-js/issues/87)) ([856dcd5](https://github.com/ibm-telemetry/telemetry-js/commit/856dcd54277531a61c0bcf9b367ad715ad4c8b10))

## [0.3.8](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.7...v0.3.8) (2023-11-15)


### Bug Fixes

* **deps:** upgrade devDependencies (minor) ([#124](https://github.com/ibm-telemetry/telemetry-js/issues/124)) ([e7cf605](https://github.com/ibm-telemetry/telemetry-js/commit/e7cf60535a68deb6c08108d0822d84cb5ea79b42))
* only consider root-most npm ls when finding installing packages ([ecb0925](https://github.com/ibm-telemetry/telemetry-js/commit/ecb09256a774a8cceac12fede327af458e655b51))
* otel currency updates, get ready for export ([f070c57](https://github.com/ibm-telemetry/telemetry-js/commit/f070c576a26fe2e8d5f2a757643b61b29786caa8))
* regular expression security hotspots ([0a1711f](https://github.com/ibm-telemetry/telemetry-js/commit/0a1711f51aa07db591ac0f7b8fbbe8e45d03af02))
* remove test output ([2a6d541](https://github.com/ibm-telemetry/telemetry-js/commit/2a6d5415e2b8896b9fe547779b56abda51d3df45))

## [0.3.7](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.6...v0.3.7) (2023-10-26)


### Bug Fixes

* **dependency-metric:** output undefined for missing attributes ([7f32468](https://github.com/ibm-telemetry/telemetry-js/commit/7f32468451fe3d7ac49065516c6dd6e241e464b6))

## [0.3.6](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.5...v0.3.6) (2023-10-26)


### Bug Fixes

* improve logging ([38178ad](https://github.com/ibm-telemetry/telemetry-js/commit/38178ad27196b49c0f0b56e0deac8d8f77f683c5))

## [0.3.5](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.4...v0.3.5) (2023-10-26)


### Bug Fixes

* improve logging stability for complex objects ([2646d66](https://github.com/ibm-telemetry/telemetry-js/commit/2646d6640c63c83578d310f279af966d22d99304))
* remove truncateString ([df495d2](https://github.com/ibm-telemetry/telemetry-js/commit/df495d28ebe62a05f01530b811880c32f599fe21))

## [0.3.4](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.3...v0.3.4) (2023-10-26)


### Bug Fixes

* add additional logging ([cd20350](https://github.com/ibm-telemetry/telemetry-js/commit/cd203508b39acfc64ef4583684ca2470e5cfa67a))

## [0.3.3](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.2...v0.3.3) (2023-10-25)


### Bug Fixes

* **index:** pass correct schema to telemetry collector ([8608b35](https://github.com/ibm-telemetry/telemetry-js/commit/8608b3534232b06b4639477c6a3c3df4865993dd))

## [0.3.2](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.1...v0.3.2) (2023-10-25)


### Bug Fixes

* experiment with app token in workflow ([7967583](https://github.com/ibm-telemetry/telemetry-js/commit/7967583a351e2be963e9053d60f1551f6b6e1955))
* ibmtelemetry bin hashbang ([18e3abb](https://github.com/ibm-telemetry/telemetry-js/commit/18e3abbb60af1acee1f6059217b3d0de477c06a1))

## [0.3.1](https://github.com/ibm-telemetry/telemetry-js/compare/v0.3.0...v0.3.1) (2023-10-24)


### Bug Fixes

* adjust pathing of bin file in package.json ([507d766](https://github.com/ibm-telemetry/telemetry-js/commit/507d7664413c758efe95cdb9bbe45a7ade89b0e4))

## [0.3.0](https://github.com/ibm-telemetry/telemetry-js/compare/v0.2.0...v0.3.0) (2023-10-24)


### Features

* add esbuild bundling ([e757e36](https://github.com/ibm-telemetry/telemetry-js/commit/e757e360d76ed4f66a8c5ce8664c4538d94474c4))
* add more details for installer to DependencyMetric ([#82](https://github.com/ibm-telemetry/telemetry-js/issues/82)) ([3a06462](https://github.com/ibm-telemetry/telemetry-js/commit/3a06462d7a4a72d6f83ceb9e094982f33445dfee))


### Bug Fixes

* correct package output files ([47d1b14](https://github.com/ibm-telemetry/telemetry-js/commit/47d1b14e1681ba72ac25b9f896721e369ce31546))
* **deps:** update node module minor versions ([1e785ca](https://github.com/ibm-telemetry/telemetry-js/commit/1e785ca5edcebb00a7133a18140ee2e701fcada0))
* **deps:** upgrade actions/checkout action to v4 ([#93](https://github.com/ibm-telemetry/telemetry-js/issues/93)) ([800d804](https://github.com/ibm-telemetry/telemetry-js/commit/800d804d27298230ba617a2c798cae802454c4e2))
* **deps:** upgrade contributor-assistant/github-action action to v2.3.1 ([#114](https://github.com/ibm-telemetry/telemetry-js/issues/114)) ([69023f4](https://github.com/ibm-telemetry/telemetry-js/commit/69023f45d6945825198e3f5044d0a1d86dd03a4d))
* **deps:** upgrade dependencies (minor) ([#108](https://github.com/ibm-telemetry/telemetry-js/issues/108)) ([eb3e4eb](https://github.com/ibm-telemetry/telemetry-js/commit/eb3e4ebc15420a7fbb8e880ebec97f7c36941551))
* **deps:** upgrade dependencies (minor) to ^1.17.0 ([#94](https://github.com/ibm-telemetry/telemetry-js/issues/94)) ([1ec3ba7](https://github.com/ibm-telemetry/telemetry-js/commit/1ec3ba710a8575d39ac02ba1fbabaf46bed28a51))
* **deps:** upgrade dependency eslint-plugin-vitest to ^0.3.1 ([#79](https://github.com/ibm-telemetry/telemetry-js/issues/79)) ([675dc5a](https://github.com/ibm-telemetry/telemetry-js/commit/675dc5a3215ae6fa7cadf56c6d01122f469888e0))
* **deps:** upgrade dependency object-scan to ^19.0.5 ([#103](https://github.com/ibm-telemetry/telemetry-js/issues/103)) ([6ba3627](https://github.com/ibm-telemetry/telemetry-js/commit/6ba3627d99a850c0aa9686740a7973bc5eecc68d))
* **deps:** upgrade devDependencies (minor) ([#104](https://github.com/ibm-telemetry/telemetry-js/issues/104)) ([7c43cbc](https://github.com/ibm-telemetry/telemetry-js/commit/7c43cbc72188de28b2039805fa6d975ed68054d2))
* **deps:** upgrade devDependencies (minor) ([#109](https://github.com/ibm-telemetry/telemetry-js/issues/109)) ([e69e4c7](https://github.com/ibm-telemetry/telemetry-js/commit/e69e4c75340cedf25728dc606362b72bed82e39c))
* **deps:** upgrade devDependencies (minor) ([#95](https://github.com/ibm-telemetry/telemetry-js/issues/95)) ([37c1acf](https://github.com/ibm-telemetry/telemetry-js/commit/37c1acfd909eaab633ac4c21c3eb235e8dc770d0))
* **logger:** consolidate trace functions and fix bugs ([aa395fe](https://github.com/ibm-telemetry/telemetry-js/commit/aa395fe7611c98a8246fc988d2640ef3e2bb88e0))
* move deps to dev deps, update ci scripts ([a3bc47c](https://github.com/ibm-telemetry/telemetry-js/commit/a3bc47c5e2caecd14de1f779ad1071725842bae1))
* update naming from telemetrics to telemetry ([cc2dbaf](https://github.com/ibm-telemetry/telemetry-js/commit/cc2dbafb4ab8b25ba747136b6ae4c4427971c4ef))
* validate presence of dependency key in npm scope ([#83](https://github.com/ibm-telemetry/telemetry-js/issues/83)) ([89c9a7c](https://github.com/ibm-telemetry/telemetry-js/commit/89c9a7c9f53ff9fdeae4b21d26311202488348f4))

## [0.2.0](https://github.com/ibm-telemetry/telemetry-js/compare/v0.1.1...v0.2.0) (2023-09-21)


### Features

* add command line data gathering and basic usages ([51ee6ac](https://github.com/ibm-telemetry/telemetry-js/commit/51ee6acbbda87d67ff96b4066aa9a6e67560f6f1))
* add DependencyMetric and NpmScope ([#53](https://github.com/ibm-telemetry/telemetry-js/issues/53)) ([fb0dd74](https://github.com/ibm-telemetry/telemetry-js/commit/fb0dd740dc11a29fa2bb333738822f957e995f92))
* add transistor config schema file ([#18](https://github.com/ibm-telemetry/telemetry-js/issues/18)) ([75c20e4](https://github.com/ibm-telemetry/telemetry-js/commit/75c20e43f1fbe40017e2782386de3f07ace76e80))
* config file schema parsing & validation ([#54](https://github.com/ibm-telemetry/telemetry-js/issues/54)) ([a6d03bb](https://github.com/ibm-telemetry/telemetry-js/commit/a6d03bb9dc76270143af08f23882f09d1f64e8bf))
* **core:** add basic otel initialization logic ([#17](https://github.com/ibm-telemetry/telemetry-js/issues/17)) ([daa73fb](https://github.com/ibm-telemetry/telemetry-js/commit/daa73fba96498101645b1b89e1b23ef8463e9c12))
* **core:** add core framework for metric and scope definition ([9df4c7d](https://github.com/ibm-telemetry/telemetry-js/commit/9df4c7dad8ab45095677cfda83e12064b78a7667))
* **core:** implement data metric capturing in Scope class ([75d1460](https://github.com/ibm-telemetry/telemetry-js/commit/75d14600770a8df427cae9966611dbf73732bb6d))
* end-to-end run logic (feat/commander) ([#81](https://github.com/ibm-telemetry/telemetry-js/issues/81)) ([3042616](https://github.com/ibm-telemetry/telemetry-js/commit/304261648ac772bf255bcab1f3ad13923edc2c36))
* logging feature ([#44](https://github.com/ibm-telemetry/telemetry-js/issues/44)) ([49e8745](https://github.com/ibm-telemetry/telemetry-js/commit/49e8745f37508716994602b4476bed72061693c4))
* **otel:** switch to global registration of meter provider ([c4284ea](https://github.com/ibm-telemetry/telemetry-js/commit/c4284ea4734d76287f2b83ced05d033346360b03))
* switch to generic project name of "telemetry" ([63a0991](https://github.com/ibm-telemetry/telemetry-js/commit/63a0991186865efe1d71c6f5587460637e1cdc44))


### Bug Fixes

* **deps:** remove @types/tmp in favor of tmp-promise ([8ee37c2](https://github.com/ibm-telemetry/telemetry-js/commit/8ee37c29c95b5864369a63aa91056c301053f69d))
* **deps:** update linter package major versions ([0d14985](https://github.com/ibm-telemetry/telemetry-js/commit/0d149851d5c79a5895a01ae3c9d2cadb60ac7d7b))
* **deps:** upgrade dependency prettier to ^3.0.3 ([#64](https://github.com/ibm-telemetry/telemetry-js/issues/64)) ([b9344c0](https://github.com/ibm-telemetry/telemetry-js/commit/b9344c0dab27a20caf4fc9d3797dbe8c6684056b))
* get package name and version ([fcc2a2e](https://github.com/ibm-telemetry/telemetry-js/commit/fcc2a2e1a2cf08aefba9fdf45ccca3ef7f96b82f))
* move origin tokenization to its own file ([#43](https://github.com/ibm-telemetry/telemetry-js/issues/43)) ([83ddce3](https://github.com/ibm-telemetry/telemetry-js/commit/83ddce3f50143f2a1e0af1ecbc39c2094df2a0f4))
* replace carbon-design-system org with ibm-telemetry ([#86](https://github.com/ibm-telemetry/telemetry-js/issues/86)) ([84feaeb](https://github.com/ibm-telemetry/telemetry-js/commit/84feaeb13e02cf58a1f8f36e8b7a76c32034ff33))
* resolve eslint warnings on jsdocs ([acb2b7d](https://github.com/ibm-telemetry/telemetry-js/commit/acb2b7d873b0051509ef2f5e361863879aed8f32))
* switching to use spawn instead of exec ([71654c7](https://github.com/ibm-telemetry/telemetry-js/commit/71654c7e57314f73ad2a7337451bff9a8aabca1a))
* upgrade commitlint monorepo ([9d2b88c](https://github.com/ibm-telemetry/telemetry-js/commit/9d2b88c1edee8e928ffd6b12920fda1055642042))
* upgrade dependency eslint to ^8.46.0 ([#22](https://github.com/ibm-telemetry/telemetry-js/issues/22)) ([bba0e94](https://github.com/ibm-telemetry/telemetry-js/commit/bba0e94f15942cf267ffacb3ad9da864bb698484))
* upgrade dependency eslint-plugin-import to ^2.28.0 ([#14](https://github.com/ibm-telemetry/telemetry-js/issues/14)) ([9d695c3](https://github.com/ibm-telemetry/telemetry-js/commit/9d695c378e8ad23ee44b5faea8dd915ec2025f14))
* upgrade dependency eslint-plugin-import to ^2.28.1 ([#55](https://github.com/ibm-telemetry/telemetry-js/issues/55)) ([bdc55c0](https://github.com/ibm-telemetry/telemetry-js/commit/bdc55c0e87331d1e3a49d637df8fff423a53c8a4))
* upgrade dependency eslint-plugin-n to ^16.0.2 ([#56](https://github.com/ibm-telemetry/telemetry-js/issues/56)) ([cf6f87f](https://github.com/ibm-telemetry/telemetry-js/commit/cf6f87fa5f2c8a2cb7551e2e52670c1b07faa837))
* upgrade dependency lint-staged to v14 ([#62](https://github.com/ibm-telemetry/telemetry-js/issues/62)) ([289e03f](https://github.com/ibm-telemetry/telemetry-js/commit/289e03f55eb19febb7ee1fc0c648c6295b51c16c))
* upgrade dependency prettier to ^3.0.1 ([#21](https://github.com/ibm-telemetry/telemetry-js/issues/21)) ([7e61348](https://github.com/ibm-telemetry/telemetry-js/commit/7e6134807ad90187c16b62e4690579f27aeddc04))
* upgrade dependency prettier to ^3.0.2 ([#48](https://github.com/ibm-telemetry/telemetry-js/issues/48)) ([df2548d](https://github.com/ibm-telemetry/telemetry-js/commit/df2548d6122dae1d264d0844a39b8eaa14b2cebf))
* upgrade opentelemetry-js monorepo to ^1.15.2 ([#24](https://github.com/ibm-telemetry/telemetry-js/issues/24)) ([d2a16d6](https://github.com/ibm-telemetry/telemetry-js/commit/d2a16d68ffad0f85454c61de14620abd6b17faae))
* upgrade vitest monorepo to ^0.34.3 ([#49](https://github.com/ibm-telemetry/telemetry-js/issues/49)) ([b211f14](https://github.com/ibm-telemetry/telemetry-js/commit/b211f14bc4f73b3712b2eb972d6b1591d0e0938f))

## [0.1.1](https://github.com/carbon-design-system/telemetry-js/compare/0.1.0...v0.1.1) (2023-07-28)


### Bug Fixes

* remove deps from allowable commit types ([fe1aea8](https://github.com/carbon-design-system/telemetry-js/commit/fe1aea80d96f5f2dbf37e75ab56dfa2b8780fd5b))
