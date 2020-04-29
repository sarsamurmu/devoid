import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import banner from 'rollup-plugin-banner';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import babel from 'rollup-plugin-babel';
import fileSize from 'rollup-plugin-filesize';
import pkg from './package.json';
import { unlinkSync, readdirSync, existsSync, statSync, rmdirSync } from 'fs';
import { join } from 'path';

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

const intro = 'window.process = { env: { NODE_ENV: "development" } };';
const input = 'src/index.ts';

if (prod) {
  const deleteFiles = (dir) => {
    if (!existsSync(dir)) return;
    readdirSync(dir).forEach((file) => {
      const filePath = join(dir, file);
      if (statSync(filePath).isDirectory()) {
        deleteFiles(filePath);
        rmdirSync(filePath);
        return;
      }
      unlinkSync(filePath);
    });
  }

  ['dist', 'types'].forEach((dir) => deleteFiles(`./${dir}`));
}

const getPlugins = (browserBuild = false) => {
  const plugins = [
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
          ...(browserBuild ? { target: 'ES5' } : {})
        }
      }
    }),
    /*
    prod && useES5 && babel({
      extensions: ['.ts'],
      presets: [
        ['@babel/env', { targets: 'ie 11', loose: true }]
      ]
    }),
    */
    prod && terser({
      output: {
        ascii_only: true
      },
      compress: {
        passes: 2
      }
    }),
    prod && cleanup({
      comments: 'none'
    }),
    prod && banner(devoidBanner),
    prod && fileSize()
  ];
  return plugins;
}

const exports = [
  {
    input,
    output: [
      {
        file: pkg.module,
        intro,
        format: 'es',
        sourcemap: !prod && 'inline'
      },
      prod && {
        file: pkg.main,
        intro,
        format: 'cjs'
      }
    ],
    plugins: getPlugins(),
    cache: !prod,
    treeshake: prod,
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
]

export default prod ? exports : exports[process.env.TYPE === 'es' ? 0 : 1];
