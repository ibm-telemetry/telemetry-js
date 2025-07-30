/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

const wcPrefixMap = new Map()

wcPrefixMap.set('@carbon/web-components/es', 'cds')
wcPrefixMap.set('@carbon/web-components/es-custom', 'cds-custom')
wcPrefixMap.set('@carbon/ibmdotcom-web-components/es', 'c4d')
wcPrefixMap.set('@carbon/ibm-products-web-components/es', 'c4p')
wcPrefixMap.set('@carbon/ibm-products-web-components/es-custom', 'c4p')

export { wcPrefixMap }
