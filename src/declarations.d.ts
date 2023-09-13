/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
declare module 'object-scan' {
  export type ObjectPath = string[]

  export default function objectScan(
    query: string[],
    options: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- module types not owned by us
      filterFn: (obj: { value: any }) => boolean
    }
  ): (obj: unknown) => ObjectPath[]
}
