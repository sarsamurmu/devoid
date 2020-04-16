import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import banner from 'rollup-plugin-banner';
import replace from '@rollup/plugin-replace';
import clear from 'rollup-plugin-delete';
import cleanup from 'rollup-plugin-cleanup';
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
const input = 'src/index.ts';
let filesCleared = false;

const getPlugins = (useES5 = false) => {
  const plugins = [
    prod && !filesCleared && clear({ targets: ['dist/*', 'types/*'] }),
    prod && replace({
      '__VERSION__': pkg.version
    }),
    resolve(),
    typescript({
      typescript: require('typescript'),
      abortOnError: false,
      check: prod,
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: prod,
          ...(useES5 ? { target: 'ES5' } : {})
        }
      }
    }),
    prod && terser({
      toplevel: true,
      compress: {
        passes: 2
      }
    }),
    prod && cleanup({
      comments: 'none'
    }),
    prod && banner(devoidBanner)
  ];
  filesCleared = true;
  return plugins;
}

const exports = [
  {
    input,
    output: [
      {
        file: pkg.module,
        intro,
        format: 'es'
      },
      {
        file: pkg.main,
        intro,
        format: 'cjs'
      }
    ],
    plugins: getPlugins()
  },
  {
    input,
    output: [
      {
        file: pkg.unpkg,
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
      }
    ],
    plugins: getPlugins(true),
    cache: !prod,
    treeshake: prod,
  }
];

export default prod ? exports : exports[1];
