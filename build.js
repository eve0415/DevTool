#!/usr/bin/env node

// @ts-check

/* eslint-disable import/no-extraneous-dependencies */

import { join } from 'path';
import { cwd } from 'process';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

build({
    entryPoints: [join(cwd(), 'src', 'index.js')],
    outfile: join(cwd(), 'out', 'index.js'),
    bundle: true,
    minify: true,
    allowOverwrite: true,
    format: 'esm',
    platform: 'node',
    tsconfig: join(cwd(), 'tsconfig.json'),
    plugins: [nodeExternalsPlugin()]
});
