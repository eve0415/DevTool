#!/usr/bin/env node

// @ts-check

/* eslint-disable import/no-extraneous-dependencies */

const { join } = require('path');
const { cwd } = require('process');
const { build } = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

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
