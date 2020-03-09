const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const version = JSON.parse(fs.readFileSync('./package.json')).version;

module.exports = (env, { mode = 'production' }) => ({
  mode,
  entry: './src/index.ts',
  output: {
    filename: 'duze.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'duze',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    enforceExtension: false,
    enforceModuleExtension: false,
    extensions: ['.js', '.ts'],
    modules: ['node_modules']
  },
  plugins: [
    new webpack.BannerPlugin(`Duze v${version}\nCopyright (c) Sarsa Murmu 2020-present\nRepository https://github.com/sarsamurmu/duze\nLicensed under The MIT License`)
  ],
  devtool: mode === 'development' ? 'cheap-module-eval-source-map' : undefined,
})
