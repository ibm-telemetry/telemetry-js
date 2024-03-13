/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { build } from 'esbuild'

const banner = `#!/usr/bin/env node
/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */`

const baseConfig = {
  banner: {
    js: banner
  },
  bundle: true,
  format: 'esm',
  minify: true,
  platform: 'node',
  target: 'es2021'
}

// collect is the main entrypoint. It calls spawn-background-process
await build({
  ...baseConfig,
  bundle: false, // Do not include other esbuild output in this file
  entryPoints: [path.join('dist', 'main', 'collect.js')],
  outfile: path.join('dist', 'collect.js'),
  target: 'es6'
})

// spawn-background-process spawns a new background-process process
await build({
  ...baseConfig,
  entryPoints: [path.join('dist', 'main', 'spawn-background-process.js')],
  outfile: path.join('dist', 'spawn-background-process.js')
})

// background-process is the main logic of the telemetry tooling
await build({
  ...baseConfig,
  entryPoints: [path.join('dist', 'main', 'background-process.js')],
  outfile: path.join('dist', 'background-process.js')
})
