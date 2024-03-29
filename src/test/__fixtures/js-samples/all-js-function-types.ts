/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-nocheck

someFunction()
  
anObject.property?.optionallyChainedFunction(1, [2,3,4])

anObject.property.aFunction('aNormalArgument')

anObject['property'].aFunction()

anObject['property'][4]('hey', 500, {yeah: 'yeah'})

anObject[BLA['property']]['aFunction']({variable, ...object})

anObject.property.aFunction?.('click', aFunction)

aFunction().anotherFunction().anotherFunction()