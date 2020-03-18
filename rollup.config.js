import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import banner from 'rollup-plugin-banner';
import pkg from './package.json';

const prod = process.env.BUILD === 'production';

const devetoBanner = `
Deveto v${pkg.version}
Copyright (c) Sarsa Murmu 2020-present
Repository https://github.com/sarsamurmu/deveto
Licensed under The MIT License
`.trim();

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'Deveto',
      sourcemap: !prod && 'inline',
    },
    prod && {
      file: pkg.module,
      format: 'es'
    }
  ],
  plugins: [
    resolve(),
    typescript({
      typescript: require('typescript'),
      abortOnError: false,
      check: prod,
      tsconfigOverride: {
        declaration: prod
      }
    }),
    prod && terser(),
    prod && banner(devetoBanner),
  ],
  cache: !prod,
}
