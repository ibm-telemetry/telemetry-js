/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

const packages = {
  carbonWc: '@carbon/web-components',
  carbonDotComWc: '@carbon/ibmdotcom-web-components',
  carbonProductsWc: '@carbon/ibm-products-web-components'
}

const buildFolders = {
  es: 'es',
  esCustom: 'es-custom'
}

export const wcPrefixMap: Map<RegExp, string> = new Map([
  [new RegExp('(^' + packages.carbonWc + '/' + buildFolders.es + '/)'), 'cds'],
  [new RegExp('(^' + packages.carbonWc + '/' + buildFolders.esCustom + '/)'), 'cds-custom'],
  [new RegExp('(^' + packages.carbonDotComWc + '/' + buildFolders.es + '/)'), 'c4d'],
  [new RegExp('(^' + packages.carbonProductsWc + '/' + buildFolders.es + '/)'), 'c4p'],
  [new RegExp('(^' + packages.carbonProductsWc + '/' + buildFolders.esCustom + '/)'), 'c4p']
])
