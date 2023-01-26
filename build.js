#!/usr/bin/env node

// @ts-check

import { error, log } from 'console';
import { context } from 'esbuild';
import { join } from 'path';
import prettyBytes from 'pretty-bytes';
import { argv, cwd, exit } from 'process';

const ctx = await context({
  entryPoints: [join(cwd(), 'src', 'index.ts')],
  outdir: join(cwd(), 'out'),
  bundle: true,
  minify: true,
  sourcesContent: false,
  allowOverwrite: true,
  format: 'esm',
  platform: 'node',
  sourcemap: 'inline',
  tsconfig: join(cwd(), 'tsconfig.json'),
  packages: 'external',
  metafile: true,
  plugins: [
    {
      name: 'bundle-size',
      setup: ({ onEnd }) => {
        onEnd(({ errors, metafile }) => {
          if (errors.length) {
            error(errors);
            return;
          }

          const size = Object.values(metafile?.outputs ?? {}).reduce(
            (a, b) => a + b.bytes,
            0
          );
          log(`Build complete with ${prettyBytes(size, { locale: 'ja' })}`);
        });
      },
    },
  ],
});

process.on('beforeExit', () => {
  ctx.dispose().catch(error);
});

if (!argv.includes('--watch')) {
  await ctx.rebuild();
  exit();
}

await ctx.watch();
