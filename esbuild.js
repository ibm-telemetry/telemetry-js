/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { build } from 'esbuild'
import path from 'path'

await build({
  banner: {
    js: `const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);`
  },
  bundle: true,
  entryPoints: [path.join('dist', 'main', 'index.js')],
  format: 'esm',
  minify: true,
  outfile: path.join('dist', 'out.js'),
  platform: 'node',
  target: 'es2021'
})