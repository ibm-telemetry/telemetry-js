/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PACKAGES = {
  CARBON_WC: '@carbon/web-components',
  CARBON_DOT_COM_WC: '@carbon/ibmdotcom-web-components',
  CARBON_PRODUCTS_WC: '@carbon/ibm-products-web-components'
}

const BUILD_FOLDERS = {
  ES_CUSTOM: 'es-custom'
}

export const wcPrefixMap: Map<RegExp, string> = new Map([
  [new RegExp('(^' + PACKAGES.CARBON_WC + '/' + BUILD_FOLDERS.ES_CUSTOM + ')'), 'cds-custom'],
  [new RegExp('(^' + PACKAGES.CARBON_WC + ')'), 'cds'],
  [new RegExp('(^' + PACKAGES.CARBON_DOT_COM_WC + ')'), 'c4d'],
  [new RegExp('(^' + PACKAGES.CARBON_PRODUCTS_WC + ')'), 'c4p']
])
