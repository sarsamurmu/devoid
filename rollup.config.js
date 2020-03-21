import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import banner from 'rollup-plugin-banner';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const prod = process.env.BUILD === 'production';

const devoidBanner = `
Devoid v${pkg.version}
Copyright (c) Sarsa Murmu 2020-present
Repository https://github.com/sarsamurmu/devoid
Licensed under The MIT License
`.trim();

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.browser,
      format: 'iife',
      name: 'Devoid',
      sourcemap: !prod && 'inline'
    },
    prod && {
      file: './dist/devoid.prod.js',
      format: 'iife',
      name: 'Devoid',
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify('production')
        })
      ]
    },
    prod && {
      file: pkg.module,
      format: 'es'
    },
    prod && {
      file: pkg.main,
      format: 'cjs'
    },
  ],
  plugins: [
    resolve(),
    typescript({
      typescript: require('typescript'),
      abortOnError: false,
      check: prod,
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        declaration: prod
      }
    }),
    prod && terser(),
    prod && banner(devoidBanner),
  ],
  cache: !prod,
}
