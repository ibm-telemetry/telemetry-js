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

// TODOASKJOE: 1-3 metrics?
aFunction().anotherFunction().anotherFunction()

// TODO: remove commented code

// {
//     name: anotherFunction
//     accessPath: [ComplexAccessor, ComplexAccessor, anotherFunction]
// }


// ------------------------------------

// anObject[BLA['property']][A_CONSTANT]({variable, ...object}) // 1 function, 2 tokens

// const something = anObject[BLA['property']][A_CONSTANT] // 2 tokens

// // 
// Function(CallExpression): 
// name: A_CONSTANT
// path: ['anObject', 'BLA.property', 'A_CONSTANT'] // needs to be substituted if doesn't come from instrumented
// - accessPath: do not capture if it doesn't come from instrumented library
// - anObject comes from instrumented <-- 
// ...


// //
// Tokens(Identifiers, ElementAccessExpression, PropertyAccessExpression):

// - anObject // 
// - A_CONSTANT // <--- token, given that it comes from instrumented
// - BLA // not a token, unless used by itself
// - BLA['property'] // <--- token
// - anObject[BLA['property']] // not a token
// - [BLA['property']][A_CONSTANT] // not a token
// - anObject[BLA['property']][A_CONSTANT] // not a token

// import anObject from 'instrumented'

// import THE_TOKEN from 'instrumented'
// import { isElementAccessExpression } from 'typescript'
// import { ElementAccessExpressionNodeHandler } from '../../../main/scopes/js/node-handlers/tokens-and-functions-handlers/element-access-expression-node-handler.js'

// anObject.property[THE_TOKEN] // <-- anObject.property[THE_TOKEN] anObject is instrumented , THE_TOKEN is THE_TOKEN is instrumented
// const whatever = THE_TOKEN

// {
// name: [something?]
// accessPath: [anObject, property, [something?]]
// }

// {
// name: THE_TOKEN
// accessPath: [THE_TOKEN]
// }

// {
// name: THE_TOKEN
// accessPath: [THE_TOKEN]
// }

// ----

// anObject[BLA['property']]['anotherProperty']

// ElementAccessExpression (complex[string]) -> ElementAccessExpression (object[complex]) => ElementAccessExpression object[string]

// leaf is string? <- capture
// leaf is complex? <- do not capture

// Capture if: argumentExpression === string

// {
// name: anotherProperty
// accessPath: [anObject, ???, anotherProperty]
// }
// {
// name: property
// accessPath: [BLA, property]
// }



// anObject.property.anotherProperty // <--- anObject is imported
// {
// name: anotherProperty
// accessPath: [anObject, property, anotherProperty]
// }