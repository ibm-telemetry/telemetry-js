/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const WC_PACKAGES = {
  CARBON_WC: '@carbon/web-components',
  CARBON_DOT_COM_WC: '@carbon/ibmdotcom-web-components',
  CARBON_PRODUCTS_WC: '@carbon/ibm-products-web-components'
}

export const WC_PACKAGE_BUILD_FOLDERS = {
  ES_CUSTOM: 'es-custom'
}

export const WC_PACKAGE_REACT_WRAPPERS = new Map([
  [WC_PACKAGES.CARBON_WC, 'react'],
  [WC_PACKAGES.CARBON_DOT_COM_WC, 'components-react']
])

export const CDN_DOMAINS = ['1.www.s81c.com']

export const CDN_ENDING = '.min.js'

export const CDN_PACKAGES = new Map([
  [WC_PACKAGES.CARBON_WC, '/carbon/web-components/'],
  [WC_PACKAGES.CARBON_DOT_COM_WC, '/carbon-for-ibm-dotcom/']
])

export const wcPrefixMap: Map<RegExp, string> = new Map([
  [
    new RegExp('(^' + WC_PACKAGES.CARBON_WC + '/' + WC_PACKAGE_BUILD_FOLDERS.ES_CUSTOM + ')'),
    'cds-custom'
  ],
  [new RegExp('(^' + WC_PACKAGES.CARBON_WC + ')'), 'cds'],
  [new RegExp('(^' + WC_PACKAGES.CARBON_DOT_COM_WC + ')'), 'c4d'],
  [new RegExp('(^' + WC_PACKAGES.CARBON_PRODUCTS_WC + ')'), 'c4p']
])
