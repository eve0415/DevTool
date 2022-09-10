#!/usr/bin/env node

// @ts-check

/* eslint-disable import/no-extraneous-dependencies */

import { join } from 'path';
import { cwd } from 'process';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

build({
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
    plugins: [nodeExternalsPlugin()],
});
