import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import banner from 'rollup-plugin-banner';
import replace from '@rollup/plugin-replace';
import clear from 'rollup-plugin-delete';
import pkg from './package.json';

const prod = process.env.BUILD === 'production';

const devoidBanner = `
Devoid v${pkg.version}
Copyright (c) Sarsa Murmu 2020-present
Repository https://github.com/sarsamurmu/devoid
Licensed under The MIT License
`.trim();

const iifeCommon = {
  format: 'iife',
  name: 'Devoid',
}

const intro = `window.process = { env: { NODE_ENV: 'development' } };`;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.browser,
      ...iifeCommon,
      intro,
      sourcemap: !prod && 'inline'
    },
    prod && {
      file: './dist/devoid.prod.js',
      ...iifeCommon,
      intro,
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify('production')
        })
      ]
    },
    prod && {
      file: pkg.module,
      intro,
      format: 'es'
    },
    prod && {
      file: pkg.main,
      intro,
      format: 'cjs'
    },
  ],
  plugins: [
    prod && clear({ targets: ['dist/*', 'types/*'] }),
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
    prod && replace({
      '__VERSION__': pkg.version
    })
  ],
  cache: !prod,
}
