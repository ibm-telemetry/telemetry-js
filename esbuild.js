/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { build } from 'esbuild'
import path from 'path'

const banner = `#!/usr/bin/env node
/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */`

// collect is the main entrypoint. It calls spawn-background-process
await build({
  banner: {
    js: banner
  },
  bundle: false,
  entryPoints: [path.join('dist', 'main', 'collect.js')],
  format: 'esm',
  minify: true,
  outfile: path.join('dist', 'collect.js'),
  platform: 'node',
  target: 'es6'
})

// spawn-background-process spawns a new background-process process
await build({
  banner: {
    js: banner
  },
  bundle: true,
  entryPoints: [path.join('dist', 'main', 'spawn-background-process.js')],
  format: 'esm',
  minify: true,
  outfile: path.join('dist', 'spawn-background-process.js'),
  platform: 'node',
  target: 'es2021'
})

// background-process is the main logic of the telemetry tooling
await build({
  banner: {
    js: banner
  },
  bundle: true,
  entryPoints: [path.join('dist', 'main', 'background-process.js')],
  format: 'esm',
  minify: true,
  outfile: path.join('dist', 'background-process.js'),
  platform: 'node',
  target: 'es2021'
})
