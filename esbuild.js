/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path'

import { build } from 'esbuild'

const banner = `#!/usr/bin/env node
/*
 * Copyright IBM Corp. 2023, 2025
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
  banner: {
    // Require, __filename, and __dirname are polyfilled here to support the bundling of commonjs
    // modules.
    js:
      banner +
      `
const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);
`
  },
  entryPoints: [path.join('dist', 'main', 'background-process.js')],
  outfile: path.join('dist', 'background-process.js')
})

// notify logs a telemetry collection notice to the console
await build({
  ...baseConfig,
  entryPoints: [path.join('dist', 'main', 'notify.js')],
  outfile: path.join('dist', 'notify.js')
})
