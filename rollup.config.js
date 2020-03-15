import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import banner from 'rollup-plugin-banner';
import pkg from './package.json';

const prod = process.env.BUILD === 'production';

const strutBanner = 
`Strut v${pkg.version}
Copyright (c) Sarsa Murmu 2020-present
Repository https://github.com/sarsamurmu/strut
Licensed under The MIT License`;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'Strut',
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
    prod && banner(strutBanner),
  ],
  cache: !prod,
}
