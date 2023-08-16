/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',

      lines: 76,
      branches: 76,

      reporter: ['text', 'lcov'],
      reportsDirectory: './.test-coverage',

      all: true,
      include: ['src/main'],
      exclude: [
        'src/main/core/exec.ts',
        'src/main/core/initialize-open-telemetry.ts',
        'src/main/core/resource-attributes.ts'
      ]
    }
  }
})
