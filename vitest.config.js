/*
 * Copyright IBM Corp. 2023, 2024
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
        'src/main/**/interfaces.ts',
        'src/main/background-process.ts',
        'src/main/collect.ts',
        'src/main/spawn-background-process.ts',
        'src/main/core/choo-choo-train.ts',
        'src/main/core/run-command.ts'
      ]
    }
  }
})
